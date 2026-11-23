import { Link } from 'react-router-dom'
import Notice from '../components/Notice.jsx'

export default function NotFoundPage({ destination = false }) {
  return (
    <div className="container page-space">
      <Notice heading="h1" title={destination ? 'Destino no encontrado' : 'Página no encontrada'} action={
        <Link className="button button--primary" to="/#destinos">Volver a destinos</Link>
      }>Explora el catálogo para encontrar un viaje.</Notice>
    </div>
  )
}
