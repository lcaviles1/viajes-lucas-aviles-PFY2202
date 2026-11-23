import { expect, test } from '@playwright/test'

async function trackMockRequests(page, failOnce = []) {
  await page.addInitScript((failedPaths) => {
    window.apiRequests = []
    const fetchOriginal = window.fetch.bind(window)

    window.fetch = (resource, options) => {
      const url = new URL(typeof resource === 'string' ? resource : resource.url, location.href)
      const path = url.pathname.endsWith('/api/destinos') ? 'rest' : url.pathname.endsWith('/graphql') ? 'graphql' : ''
      if (path) {
        window.apiRequests.push(path === 'rest' ? 'rest' : JSON.parse(options.body).operationName)
        const failure = failedPaths.indexOf(path)
        if (failure !== -1) {
          failedPaths.splice(failure, 1)
          return Promise.resolve(new Response('Servicio temporalmente no disponible', { status: 503 }))
        }
      }
      return fetchOriginal(resource, options)
    }
  }, failOnce)
}

test('Catálogo REST, filtros, resultados vacíos y enlaces de destino', async ({ page }) => {
  await trackMockRequests(page)
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Tu próximo viaje empieza aquí.' })).toBeVisible()
  await page.locator('.hero').getByRole('link', { name: 'Explorar destinos' }).click()
  await expect(page).toHaveURL(/#\/#destinos$/)
  await expect(page.getByRole('article')).toHaveCount(6)
  await expect(page.getByText('Torres del Paine', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Cultura' }).click()
  await expect(page.getByRole('article')).toHaveCount(3)
  await page.getByRole('searchbox', { name: 'Buscar destinos' }).fill('peru')
  await expect(page.getByRole('article')).toHaveCount(1)
  await page.getByRole('searchbox').fill('abc123')
  await expect(page.getByText('No hay destinos con estos filtros')).toBeVisible()
  await page.getByRole('button', { name: 'Limpiar filtros' }).click()
  await expect(page.getByRole('article')).toHaveCount(6)

  expect(await page.evaluate(() => window.apiRequests)).toEqual(['rest'])
  await page.getByRole('link', { name: 'Ver opciones para Kioto' }).click()
  await expect(page.getByRole('heading', { name: 'Kioto', level: 1 })).toBeVisible()
  await expect(page.getByText('Osaka (KIX)').first()).toBeVisible()
  await page.getByRole('navigation', { name: 'Ruta de navegación' }).getByRole('link').click()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Vuelos disponibles' })).toBeVisible()
  expect(await page.evaluate(() => window.apiRequests)).toEqual(['rest', 'TripOptions'])
  expect(pageErrors).toEqual([])
})

test('GraphQL muestra fechas, tarifas y cupos y guarda la combinación sin repetir la consulta', async ({ page }) => {
  await trackMockRequests(page)
  await page.goto('./#/destinos/machu-picchu')
  await expect(page.getByRole('heading', { name: 'Machu Picchu', level: 1 })).toBeVisible()
  const firstFlight = page.getByRole('article').first()
  await expect(firstFlight.locator('time')).toHaveCount(2)
  await expect(firstFlight.getByText('$319.900', { exact: true })).toBeVisible()
  await expect(firstFlight.getByText('7 asientos disponibles', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Seleccionar Aerolínea Travesía' })).toBeDisabled()
  await page.getByRole('button', { name: 'Seleccionar Aerolínea Horizonte' }).click()

  await page.getByRole('button', { name: /Hoteles/ }).click()
  await expect(page.getByRole('heading', { name: 'Hoteles disponibles' })).toBeVisible()
  await expect(page.getByText('5 habitaciones disponibles')).toBeVisible()
  await expect(page.getByText('$41.900', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Seleccionar Casa del Valle' }).click()
  await expect(page.getByText('Las fechas seleccionadas no coinciden.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Guardar itinerario' })).toBeDisabled()
  await page.getByRole('button', { name: 'Seleccionar Patio de los Andes' }).click()
  await expect(page.getByText('$529.400', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Guardar itinerario' }).click()
  await expect(page.getByRole('button', { name: 'Itinerario guardado', exact: true })).toBeDisabled()
  expect(await page.evaluate(() => window.apiRequests)).toEqual(['rest', 'TripOptions', 'SetTripPlan'])

  await page.reload()
  await expect(page.getByRole('button', { name: 'Itinerario guardado', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Eliminar itinerario guardado' }).click()
  await expect(page.getByText('Itinerario eliminado.', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Guardar itinerario' })).toBeDisabled()
})

test('Muestra errores recuperables en REST y GraphQL y permite regresar de un destino inexistente', async ({ page }) => {
  await trackMockRequests(page, ['rest', 'graphql'])
  await page.goto('./#/destinos/patagonia')
  await expect(page.getByRole('alert')).toContainText('No pudimos cargar el destino')
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(page.getByRole('alert')).toContainText('No pudimos cargar las opciones')
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(page.getByText('Puerto Natales (PNT)').first()).toBeVisible()

  await page.goto('./#/destinos/inexistente')
  await expect(page.getByRole('heading', { name: 'Destino no encontrado' })).toBeVisible()
  await page.getByRole('link', { name: 'Volver a destinos' }).click()
  await expect(page.getByRole('article')).toHaveCount(6)
  await page.goto('./#/ruta-inexistente')
  await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible()
})

test('Fotografías y contenido se ajustan al ancho de la pantalla', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('article')).toHaveCount(6)
  const images = page.locator('.destination-photo img')
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth))
  await page.getByRole('link', { name: 'Ver opciones para Reikiavik' }).click()
  await expect(page.getByRole('heading', { name: 'Vuelos disponibles' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth))
})
