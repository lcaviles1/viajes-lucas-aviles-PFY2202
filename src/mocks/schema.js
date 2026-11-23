import { buildSchema, GraphQLError } from 'graphql'
import { findOptions } from './catalog.js'

export const schema = buildSchema(`
  type Flight {
    id: ID!
    airline: String!
    origin: String!
    airport: String!
    gateway: String!
    departureDate: String!
    arrivalDate: String!
    returnDate: String!
    duration: String!
    stops: Int!
    price: Int!
    availableSeats: Int!
  }

  type Hotel {
    id: ID!
    name: String!
    stars: Int!
    roomType: String!
    checkIn: String!
    checkOut: String!
    pricePerNight: Int!
    availableRooms: Int!
  }

  type TripPlan {
    flightId: ID!
    hotelId: ID!
  }

  type TripOptions {
    id: ID!
    flights: [Flight!]!
    hotels: [Hotel!]!
    plan: TripPlan
  }

  input TripPlanInput {
    flightId: ID!
    hotelId: ID!
  }

  type Query {
    tripOptions(destinationId: ID!): TripOptions!
  }

  type Mutation {
    setTripPlan(destinationId: ID!, plan: TripPlanInput): TripOptions!
  }
`)

function validateOptions(destinationId) {
  const options = findOptions(destinationId)
  if (!options) {
    throw new GraphQLError('El destino indicado no existe.', { extensions: { code: 'NOT_FOUND' } })
  }
  return options
}

function validatePlan({ flights, hotels }, plan) {
  const flight = flights.find((option) => option.id === plan.flightId)
  const hotel = hotels.find((option) => option.id === plan.hotelId)
  if (!flight?.availableSeats || !hotel?.availableRooms) {
    throw new GraphQLError('Selecciona un vuelo y un hotel con cupos para este destino.', {
      extensions: { code: 'UNAVAILABLE' },
    })
  }
  if (flight.arrivalDate !== hotel.checkIn || flight.returnDate !== hotel.checkOut) {
    throw new GraphQLError('La estadía debe coincidir con la llegada y el vuelo de vuelta.', {
      extensions: { code: 'DATE_MISMATCH' },
    })
  }
}

export function createResolvers(storage) {
  const plans = new Map()

  function storageKey({ id, flights }) {
    return `vaiven:plan:v1:${id}:${flights[0].departureDate}`
  }

  function readPlan(options) {
    const { id } = options
    if (plans.has(id)) return plans.get(id)
    try {
      return JSON.parse(storage?.getItem(storageKey(options)) ?? 'null')
    } catch {
      return null
    }
  }

  return {
    tripOptions({ destinationId }) {
      const options = validateOptions(destinationId)
      return { ...options, plan: readPlan(options) }
    },
    setTripPlan({ destinationId, plan = null }) {
      const options = validateOptions(destinationId)
      if (plan) validatePlan(options, plan)
      plans.set(destinationId, plan)
      try {
        storage?.setItem(storageKey(options), JSON.stringify(plan))
      } catch {
        // The mock remains usable when browser storage is blocked.
      }
      return { ...options, plan }
    },
  }
}
