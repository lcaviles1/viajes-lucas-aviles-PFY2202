import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { destinationPhoto } from '../api/format.js'

export default function DestinationCard({ destination }) {
  const { id, name, country, region, category, description, activities } = destination

  return (
    <article className="destination-card">
      <div className="destination-photo">
        <img src={destinationPhoto(id)} alt="" loading="lazy" width="620" height="370" />
        <span className="photo-label">{category}</span>
      </div>
      <div className="destination-body">
        <p className="location"><MapPin size={15} aria-hidden="true" /> {country} · {region}</p>
        <h3>{name}</h3>
        <p className="destination-description">{description}</p>
        <ul className="tags" aria-label={`Actividades en ${name}`}>
          {activities.map((activity) => <li key={activity}>{activity}</li>)}
        </ul>
        <Link className="card-link" to={`/destinos/${id}`} aria-label={`Ver opciones para ${name}`}>
          Ver vuelos y hoteles
        </Link>
      </div>
    </article>
  )
}
