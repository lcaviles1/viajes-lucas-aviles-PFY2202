import { ApolloProvider } from '@apollo/client/react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/playfair-display'
import { apolloClient } from './api/apollo.js'
import Layout from './components/Layout.jsx'
import Notice from './components/Notice.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import DestinationPage from './pages/DestinationPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './styles.css'

const root = createRoot(document.getElementById('root'))

root.render(<div className="container page-space"><Notice type="loading" title="Abriendo Vaivén…" /></div>)

import('./mocks/browser.js').then(({ startMockApi }) => startMockApi()).then(() => {
  root.render(
    <ApolloProvider client={apolloClient}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="destinos/:destinationId" element={<DestinationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ApolloProvider>,
  )
}).catch((error) => {
  console.error('No se pudo iniciar la API simulada', error)
  root.render(
    <div className="container page-space">
      <Notice type="error" title="No pudimos abrir Vaivén" action={
        <button className="button button--outline" type="button" onClick={() => window.location.reload()}>Recargar</button>
      }>Para ejecutar la demostración, abre el sitio por HTTPS o usa la dirección local de Vite.</Notice>
    </div>,
  )
})
