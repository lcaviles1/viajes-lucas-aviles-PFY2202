import { graphql } from 'graphql'
import { delay, http, HttpResponse } from 'msw'
import { destinationsEndpoint, graphQLEndpoint } from '../api/endpoints.js'
import { destinations } from './catalog.js'
import { createResolvers, schema } from './schema.js'

export function createHandlers({ origin = globalThis.location?.origin, latency = 0, storage } = {}) {
  const rootValue = createResolvers(storage)

  return [
    http.get(new URL(destinationsEndpoint, origin).href, async () => {
      await delay(latency)
      return HttpResponse.json({ destinations })
    }),
    http.post(new URL(graphQLEndpoint, origin).href, async ({ request }) => {
      await delay(latency)
      const body = await request.json().catch(() => null)
      if (typeof body?.query !== 'string') {
        return HttpResponse.json({
          errors: [{ message: 'Se requiere una consulta GraphQL.' }],
        }, { status: 400 })
      }

      const result = await graphql({
        schema,
        rootValue,
        source: body.query,
        operationName: body.operationName,
        variableValues: body.variables,
      })
      return HttpResponse.json(result)
    }),
  ]
}
