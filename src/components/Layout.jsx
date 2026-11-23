import { Compass } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useDestinations } from '../api/useDestinations.js'

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Vaivén, inicio">
      <span className="brand-mark"><Compass size={22} aria-hidden="true" /></span>
      Vaivén<span className="brand-dot" aria-hidden="true">.</span>
    </Link>
  )
}

export default function Layout() {
  const request = useDestinations()
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (hash === '#destinos') {
      document.getElementById('destinos')?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash, key])

  return (
    <>
      <a className="skip-link" href="#contenido" onClick={(event) => {
        event.preventDefault()
        document.getElementById('contenido')?.focus()
      }}>Saltar al contenido</a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav aria-label="Navegación principal">
            <Link className="nav-link" to="/#destinos">Explorar destinos</Link>
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex={-1}>
        <Outlet context={request} />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <Brand />
          <p>Agencia de viajes de demostración · Tarifas en CLP</p>
        </div>
      </footer>
    </>
  )
}
