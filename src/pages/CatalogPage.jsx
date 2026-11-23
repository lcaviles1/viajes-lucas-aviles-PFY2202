import { MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import DestinationCard from '../components/DestinationCard.jsx'
import Notice from '../components/Notice.jsx'
import { destinationPhoto } from '../api/format.js'

const categories = ['Todos', 'Naturaleza', 'Cultura', 'Playa']

function normalize(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export default function CatalogPage() {
  const request = useOutletContext()
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const term = normalize(search)
  const visible = request.destinations?.filter((destination) => {
    const fields = [destination.name, destination.country, destination.region, ...destination.activities]
    return (category === 'Todos' || destination.category === category)
      && fields.some((value) => normalize(value).includes(term))
  }) ?? []

  function resetFilters() {
    setCategory('Todos')
    setSearch('')
  }

  return (
    <div className="container catalog">
      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-photo" src={destinationPhoto('machu-picchu')} alt="" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <h1 id="hero-title">Tu próximo viaje<br className="wide-break" /> empieza aquí.</h1>
          <p>Descubre nuevos destinos, compara vuelos y hoteles y arma un viaje a tu medida.</p>
          <Link className="button button--primary" to="/#destinos">Explorar destinos</Link>
        </div>
        <span className="hero-location"><MapPin size={15} aria-hidden="true" /> Machu Picchu, Perú</span>
      </section>

      <section className="catalog-section" id="destinos" aria-labelledby="catalog-title">
        <div className="section-heading">
          <h2 id="catalog-title">Explora destinos</h2>
          <p>Elige un lugar para ver fechas, precios y disponibilidad.</p>
        </div>

        {request.status === 'loading' && <Notice type="loading" title="Cargando destinos…" />}
        {request.status === 'error' && (
          <Notice type="error" title="No pudimos cargar los destinos" action={
            <button className="button button--outline" type="button" onClick={request.retry}>Reintentar</button>
          }>Vuelve a solicitar el catálogo.</Notice>
        )}
        {request.status === 'success' && (
          <>
            <div className="filters">
              <div className="filter-chips" role="group" aria-label="Categoría del destino">
                {categories.map((item) => (
                  <button className="chip" key={item} type="button"
                    aria-pressed={category === item} onClick={() => setCategory(item)}>
                    {item}
                  </button>
                ))}
              </div>
              <label className="search">
                <span className="sr-only">Buscar destinos</span>
                <Search size={19} aria-hidden="true" />
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                  placeholder="Busca un destino o país" />
              </label>
            </div>

            <p className="result-count" role="status">
              {visible.length} {visible.length === 1 ? 'destino' : 'destinos'}
            </p>
            {visible.length ? (
              <div className="destination-grid">
                {visible.map((destination) => <DestinationCard key={destination.id} destination={destination} />)}
              </div>
            ) : (
              <Notice title="No hay destinos con estos filtros" action={
                <button className="button button--outline" type="button" onClick={resetFilters}>Limpiar filtros</button>
              }>Prueba otro destino, país o categoría.</Notice>
            )}
          </>
        )}
      </section>
    </div>
  )
}
