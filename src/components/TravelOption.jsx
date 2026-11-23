import { BedDouble, CalendarDays, Clock3, Plane, Star } from 'lucide-react'
import { money, shortDate } from '../api/format.js'

function plural(quantity, singular, pluralForm) {
  return `${quantity} ${quantity === 1 ? singular : pluralForm}`
}

export default function TravelOption({ type, option, selected, onSelect, busy }) {
  const flight = type === 'flights'
  const Icon = flight ? Plane : BedDouble
  const name = flight ? option.airline : option.name
  const dates = flight ? [option.departureDate, option.returnDate] : [option.checkIn, option.checkOut]
  const overnight = flight && option.arrivalDate !== option.departureDate
  const available = flight ? option.availableSeats : option.availableRooms
  const availability = flight
    ? plural(available, 'asiento disponible', 'asientos disponibles')
    : plural(available, 'habitación disponible', 'habitaciones disponibles')

  return (
    <article className="travel-option">
      <span className="option-icon"><Icon size={21} aria-hidden="true" /></span>
      <div className="option-details">
        <h4>{name}</h4>
        {flight ? (
          <p className="option-route">Santiago ({option.origin}) → {option.gateway} ({option.airport})</p>
        ) : (
          <p className="option-route">{option.roomType}</p>
        )}
        <p className="option-meta">
          <CalendarDays size={16} aria-hidden="true" />
          <span>
            {flight ? 'Ida' : 'Entrada'} <time dateTime={dates[0]}>{shortDate(dates[0])}</time>
            {overnight && <> · Llegada <time dateTime={option.arrivalDate}>{shortDate(option.arrivalDate)}</time></>}
            {' · '}
            {flight ? 'Vuelta' : 'Salida'} <time dateTime={dates[1]}>{shortDate(dates[1])}</time>
          </span>
        </p>
        <p className="option-meta">
          {flight ? <Clock3 size={16} aria-hidden="true" /> : <Star size={16} aria-hidden="true" />}
          {flight
            ? `${option.duration} · ${option.stops ? plural(option.stops, 'escala', 'escalas') : 'Directo'}`
            : plural(option.stars, 'estrella', 'estrellas')}
        </p>
        <span className={`availability ${available ? '' : 'availability--closed'}`}>
          {available ? availability : 'Sin disponibilidad'}
        </span>
      </div>
      <div className="option-action">
        <p className="option-price">{money(flight ? option.price : option.pricePerNight)}</p>
        <p className="option-unit">{flight ? 'ida y vuelta por persona' : 'por noche'}</p>
        <button type="button" className="button button--outline button--small" aria-pressed={selected}
          aria-label={`Seleccionar ${name}`} disabled={!available || busy}
          onClick={() => onSelect(option.id)}>
          {selected ? 'Seleccionado' : available ? 'Seleccionar' : 'Sin cupos'}
        </button>
      </div>
    </article>
  )
}
