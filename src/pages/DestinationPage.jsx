import { useQuery } from '@apollo/client/react'
import { MapPin } from 'lucide-react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { GET_TRIP_OPTIONS } from '../api/apollo.js'
import { destinationPhoto } from '../api/format.js'
import Notice from '../components/Notice.jsx'
import TripPlanner from '../components/TripPlanner.jsx'
import NotFoundPage from './NotFoundPage.jsx'

function Options({ destinationId }) {
  const { data, loading, error, refetch } = useQuery(GET_TRIP_OPTIONS, {
    variables: { destinationId },
    fetchPolicy: 'cache-first',
  })

  if (loading) return <Notice type="loading" title="Buscando vuelos y hoteles…" />
  if (error || !data?.tripOptions) {
    return (
      <Notice type="error" title="No pudimos cargar las opciones" action={
        <button className="button button--outline" type="button"
          onClick={() => { void refetch().catch(() => {}) }}>Reintentar</button>
      }>Vuelve a consultar los vuelos y hoteles de este destino.</Notice>
    )
  }
  return <TripPlanner trip={data.tripOptions} />
}

export default function DestinationPage() {
  const { destinationId } = useParams()
  const request = useOutletContext()

  if (request.status === 'loading') {
    return <div className="container page-space"><Notice type="loading" title="Cargando destino…" /></div>
  }
  if (request.status === 'error') {
    return (
      <div className="container page-space">
        <Notice type="error" title="No pudimos cargar el destino" action={
          <button className="button button--outline" type="button" onClick={request.retry}>Reintentar</button>
        }>Vuelve a solicitar el catálogo.</Notice>
      </div>
    )
  }

  const destination = request.destinations.find(({ id }) => id === destinationId)
  if (!destination) return <NotFoundPage destination />

  return (
    <div className="container detail">
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/#destinos">Destinos</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{destination.name}</span>
      </nav>
      <section className="detail-hero" aria-labelledby="destination-title">
        <div className="detail-copy">
          <p className="location"><MapPin size={17} aria-hidden="true" /> {destination.country} · {destination.region}</p>
          <h1 id="destination-title">{destination.name}</h1>
          <p className="detail-description">{destination.description}</p>
          <ul className="tags" aria-label="Actividades populares">
            {destination.activities.map((activity) => <li key={activity}>{activity}</li>)}
          </ul>
        </div>
        <img src={destinationPhoto(destination.id)} alt={destination.imageAlt} />
      </section>
      <section className="planning-section" aria-labelledby="planning-title">
        <div className="section-heading">
          <h2 id="planning-title">Planifica tu viaje</h2>
          <p>Compara vuelos desde Santiago y estadías para las fechas disponibles.</p>
        </div>
        <Options key={destinationId} destinationId={destinationId} />
      </section>
    </div>
  )
}
