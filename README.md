# Vaivén

Vaivén es una agencia de viajes de demostración. Explora destinos, compara vuelos desde Santiago y hoteles, y guarda un itinerario durante la sesión. Las fechas, tarifas y cupos son simulados.

**Lucas Avilés · Desarrollo Frontend II (PFY2202) · Experiencia 2, Semana 5, forma B**

[Abrir Vaivén en GitHub Pages](https://lcaviles1.github.io/viajes-lucas-aviles-PFY2202/)

## Ejecutar en local

Requiere Node.js 22.12 o posterior dentro de la rama 22, o una LTS reciente compatible.

```sh
npm ci
npm run dev
```

Abre la dirección local que indica Vite. El navegador debe admitir Service Workers y abrir el sitio en localhost o mediante HTTPS. El mock se inicia automáticamente.

Para generar la aplicación de producción, ejecuta `npm run build`. Puedes abrir esa versión en local con `npm run preview`.

## Explorar y planificar

1. Busca un destino por nombre, país o actividad. También puedes filtrar los destinos por categoría.
2. En el destino, alterna entre **Vuelos** y **Hoteles** para revisar fechas, cupos y tarifas en pesos chilenos. Los vuelos muestran el precio de ida y vuelta por persona y los hoteles muestran el precio por noche.
3. Para guardar un itinerario, selecciona un vuelo y un hotel con cupos. La estadía debe coincidir con la llegada del vuelo y terminar el día de vuelta. Vaivén suma el vuelo y las noches de hotel para una persona. Puedes actualizar o eliminar el plan desde la misma pantalla.

## Integración

- **REST** · `GET /api/destinos` entrega el catálogo con país, región y actividades. React ejecuta una solicitud compartida al abrir la aplicación. Los filtros operan sobre la respuesta en memoria.
- **GraphQL** · `POST /graphql` ejecuta el [esquema y los resolvers](src/mocks/schema.js). La consulta `TripOptions` reúne vuelos, hoteles y plan mediante la variable `destinationId`. Apollo Client conserva los datos por destino y la mutación `SetTripPlan` actualiza el plan en caché con su respuesta, sin volver a consultar vuelos y hoteles. Si recargas en la misma pestaña, el mock recupera el plan de `sessionStorage`.
- **Mock Service Worker** · Intercepta solicitudes HTTP del navegador a ambos endpoints bajo la ruta base de la aplicación. Permite ejecutar la demostración en GitHub Pages. Las pruebas de contrato reutilizan los handlers con `msw/node`.
- **React Router** · Navega entre el catálogo, el detalle de cada destino y la vista para rutas desconocidas. Las URLs con hash permiten abrir directamente un detalle o recargarlo en GitHub Pages.

## Pruebas

```sh
npm test
npx playwright install chromium firefox webkit
npm run test:e2e
```

Las pruebas de navegador usan la compilación de producción bajo la misma ruta base de GitHub Pages. Playwright ejecuta los flujos en Chromium y Firefox de escritorio, y WebKit con tamaño de iPhone.

## Fotografías

Fotografías distribuidas bajo la [licencia de Unsplash](https://unsplash.com/license).

- Machu Picchu — [Azzedine Rouichi](https://unsplash.com/es/fotos/machu-picchu-peru-durante-el-dia-l28V2fyisao).
- Patagonia — [William Warby](https://unsplash.com/photos/a-scenic-view-of-a-lake-and-mountains-bv2svF6uVGE).
- Kioto — [JUNHYUNG PARK](https://unsplash.com/photos/a-building-on-a-hill-surrounded-by-trees-jJFlBoyoodY).
- Lisboa — [Get Golden Visa](https://unsplash.com/photos/a-beautiful-cityscape-of-lisbon-portugal-under-a-blue-sky-M0ywxxUOIkE).
- Cartagena — [Ricardo Gomez Angel](https://unsplash.com/photos/colonial-street-and-church-in-cartagena-GcHar4P8V_Q).
- Reikiavik — [Tabea Schimpf](https://unsplash.com/photos/aerial-photography-of-city-surrounded-with-snow-K2NfQ_IAZKM).
