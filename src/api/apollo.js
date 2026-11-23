import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client'
import { graphQLEndpoint } from './endpoints.js'

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: graphQLEndpoint }),
  cache: new InMemoryCache(),
})

const PLAN_FIELDS = gql`
  fragment PlanFields on TripOptions {
    id
    plan {
      flightId
      hotelId
    }
  }
`

export const GET_TRIP_OPTIONS = gql`
  query TripOptions($destinationId: ID!) {
    tripOptions(destinationId: $destinationId) {
      ...PlanFields
      flights {
        id
        airline
        origin
        airport
        gateway
        departureDate
        arrivalDate
        returnDate
        duration
        stops
        price
        availableSeats
      }
      hotels {
        id
        name
        stars
        roomType
        checkIn
        checkOut
        pricePerNight
        availableRooms
      }
    }
  }
  ${PLAN_FIELDS}
`

export const SET_TRIP_PLAN = gql`
  mutation SetTripPlan($destinationId: ID!, $plan: TripPlanInput) {
    setTripPlan(destinationId: $destinationId, plan: $plan) {
      ...PlanFields
    }
  }
  ${PLAN_FIELDS}
`
