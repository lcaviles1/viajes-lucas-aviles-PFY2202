import { useEffect, useState } from 'react'
import { destinationsEndpoint } from './endpoints.js'

export function useDestinations() {
  const [request, setRequest] = useState({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(destinationsEndpoint, { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const { destinations } = await response.json()
        if (!Array.isArray(destinations)) throw new Error('Respuesta REST inválida')
        if (!controller.signal.aborted) setRequest({ status: 'success', destinations })
      } catch {
        if (!controller.signal.aborted) setRequest({ status: 'error' })
      }
    }

    load()
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setRequest({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return { ...request, retry }
}
