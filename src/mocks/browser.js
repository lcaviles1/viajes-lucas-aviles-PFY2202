import { setupWorker } from 'msw/browser'
import { createHandlers } from './handlers.js'

export async function startMockApi() {
  let storage
  try {
    storage = window.sessionStorage
  } catch {
    // The demo can keep plans in memory when storage is unavailable.
  }

  const worker = setupWorker(...createHandlers({ latency: 220, storage }))
  await worker.start({
    quiet: true,
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}
