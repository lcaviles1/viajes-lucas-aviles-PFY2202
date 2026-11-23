import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { setupServer } from 'msw/node'
import { createHandlers } from '../src/mocks/handlers.js'

const origin = 'http://localhost:4173'
const server = setupServer(...createHandlers({ origin }))
const query = `
  query Options($id: ID!) {
    tripOptions(destinationId: $id) {
      id flights { id price departureDate arrivalDate returnDate availableSeats }
      hotels { id pricePerNight checkIn checkOut availableRooms }
      plan { flightId hotelId }
    }
  }
`
const mutation = `
  mutation Save($id: ID!, $plan: TripPlanInput) {
    setTripPlan(destinationId: $id, plan: $plan) { id plan { flightId hotelId } }
  }
`

async function graphql(document, variables) {
  const res = await fetch(`${origin}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: document, variables }),
  })
  assert.equal(res.status, 200)
  return res.json()
}

describe('Contratos de las API simuladas', () => {
  before(() => server.listen({ onUnhandledRequest: 'error' }))
  after(() => server.close())

  test('REST lista destinos únicos y cada uno tiene vuelos y hoteles válidos en GraphQL', async () => {
    const res = await fetch(`${origin}/api/destinos`)
    assert.equal(res.status, 200)
    const { destinations } = await res.json()
    assert.equal(destinations.length, 6)
    assert.equal(new Set(destinations.map(({ id }) => id)).size, destinations.length)

    for (const { id, name, country, activities } of destinations) {
      assert.ok(name && country && activities.length >= 1)
      const { data, errors } = await graphql(query, { id })
      assert.equal(errors, undefined)
      const { flights, hotels } = data.tripOptions
      assert.equal(data.tripOptions.id, id)
      assert.equal(flights.length, 3)
      assert.equal(hotels.length, 3)
      assert.ok(flights.every((flight) => flight.price > 0 && flight.returnDate > flight.departureDate))
      assert.ok(hotels.every((hotel) => hotel.pricePerNight > 0 && hotel.checkOut > hotel.checkIn))
      assert.ok(flights.every((flight, index) => flight.arrivalDate >= flight.departureDate
        && hotels[index].checkIn === flight.arrivalDate && hotels[index].checkOut === flight.returnDate))
      if (id === 'kyoto') assert.ok(flights[0].arrivalDate > flights[0].departureDate)
      assert.ok(flights.some((flight) => flight.availableSeats > 0))
      assert.ok(hotels.some((hotel) => hotel.availableRooms > 0))
    }
  })

  test('GraphQL respeta la selección de campos, valida el esquema y distingue IDs desconocidos', async () => {
    const minimal = await graphql('query { tripOptions(destinationId:"kyoto") { id } }')
    assert.deepEqual(minimal.data, { tripOptions: { id: 'kyoto' } })
    const badField = await graphql('query { tripOptions(destinationId:"kyoto") { inexistente } }')
    assert.match(badField.errors[0].message, /inexistente/)
    const missing = await graphql(query, { id: 'destino-inexistente' })
    assert.equal(missing.errors[0].extensions.code, 'NOT_FOUND')
  })

  test('La mutación guarda, valida y elimina un plan sin alterar las opciones', async () => {
    const id = 'machu-picchu'
    const plan = { flightId: `${id}-f1`, hotelId: `${id}-h1` }

    const saved = await graphql(mutation, { id, plan })
    assert.deepEqual(saved.data.setTripPlan.plan, plan)
    const mismatched = await graphql(mutation, { id, plan: { ...plan, hotelId: `${id}-h2` } })
    assert.equal(mismatched.errors[0].extensions.code, 'DATE_MISMATCH')
    const soldOut = await graphql(mutation, { id, plan: { flightId: `${id}-f3`, hotelId: `${id}-h3` } })
    assert.equal(soldOut.errors[0].extensions.code, 'UNAVAILABLE')
    const wrongId = await graphql(mutation, { id, plan: { ...plan, hotelId: 'kyoto-h1' } })
    assert.equal(wrongId.errors[0].extensions.code, 'UNAVAILABLE')
    const persisted = await graphql(query, { id })
    assert.deepEqual(persisted.data.tripOptions.plan, plan)
    assert.equal(persisted.data.tripOptions.flights[0].availableSeats, 7)
    const separate = await graphql(query, { id: 'patagonia' })
    assert.equal(separate.data.tripOptions.plan, null)
    const removed = await graphql(mutation, { id, plan: null })
    assert.equal(removed.data.setTripPlan.plan, null)
  })

  test('El endpoint rechaza un cuerpo sin consulta con HTTP 400', async () => {
    const res = await fetch(`${origin}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variables: {} }),
    })
    assert.equal(res.status, 400)
    assert.match((await res.json()).errors[0].message, /consulta GraphQL/)
  })
})
