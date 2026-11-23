import { useMutation } from '@apollo/client/react'
import { BedDouble, Check, Plane } from 'lucide-react'
import { useState } from 'react'
import { money, nightsBetween } from '../api/format.js'
import { SET_TRIP_PLAN } from '../api/apollo.js'
import TravelOption from './TravelOption.jsx'

const emptyPlan = { flightId: null, hotelId: null }

export default function TripPlanner({ trip }) {
  const [type, setType] = useState('flights')
  const [draft, setDraft] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [save, { loading }] = useMutation(SET_TRIP_PLAN)

  const plan = draft ?? trip.plan ?? emptyPlan
  const flight = trip.flights.find(({ id }) => id === plan.flightId)
  const hotel = trip.hotels.find(({ id }) => id === plan.hotelId)
  const nights = hotel ? nightsBetween(hotel.checkIn, hotel.checkOut) : 0
  const compatible = Boolean(flight && hotel
    && flight.arrivalDate === hotel.checkIn && flight.returnDate === hotel.checkOut)
  const saved = Boolean(trip.plan && plan.flightId === trip.plan.flightId && plan.hotelId === trip.plan.hotelId)
  const selectionKey = type === 'flights' ? 'flightId' : 'hotelId'
  const title = type === 'flights' ? 'Vuelos disponibles' : 'Hoteles disponibles'

  function choose(id) {
    setDraft({ ...plan, [selectionKey]: plan[selectionKey] === id ? null : id })
    setFeedback(null)
  }

  async function submit(nextPlan) {
    setFeedback(null)
    try {
      const variables = {
        destinationId: trip.id,
        plan: nextPlan ? { flightId: nextPlan.flightId, hotelId: nextPlan.hotelId } : null,
      }
      await save({ variables })
      setDraft(null)
      setFeedback({ message: nextPlan ? 'Itinerario guardado en esta sesión.' : 'Itinerario eliminado.' })
    } catch {
      setFeedback({ error: true, message: 'No pudimos actualizar tu itinerario. Inténtalo otra vez.' })
    }
  }

  return (
    <div className="planner-grid">
      <section aria-labelledby="option-list-title">
        <div className="option-switch" role="group" aria-label="Tipo de opción">
          <button type="button" aria-pressed={type === 'flights'} onClick={() => setType('flights')}>
            <Plane size={19} aria-hidden="true" /> Vuelos <span>{trip.flights.length}</span>
          </button>
          <button type="button" aria-pressed={type === 'hotels'} onClick={() => setType('hotels')}>
            <BedDouble size={19} aria-hidden="true" /> Hoteles <span>{trip.hotels.length}</span>
          </button>
        </div>
        <h3 className="options-title" id="option-list-title">{title}</h3>
        <div className="option-list">
          {trip[type].length ? trip[type].map((option) => (
            <TravelOption key={option.id} option={option} type={type} selected={plan[selectionKey] === option.id}
              busy={loading} onSelect={choose} />
          )) : <p>Por ahora no hay opciones para este destino.</p>}
        </div>
      </section>

      <aside className="plan" aria-labelledby="plan-title">
        <h3 id="plan-title">Tu itinerario</h3>
        <p>Elige un hotel desde la llegada del vuelo hasta el día de vuelta.</p>
        <dl className="plan-lines">
          <div><dt><Plane size={17} aria-hidden="true" /> Vuelo</dt><dd>{flight?.airline ?? 'Sin elegir'}</dd></div>
          <div><dt><BedDouble size={17} aria-hidden="true" /> Hotel</dt><dd>{hotel ? `${hotel.name} · ${nights} noches` : 'Sin elegir'}</dd></div>
          <div className="plan-total"><dt>Total estimado</dt><dd>{compatible ? money(flight.price + nights * hotel.pricePerNight) : '—'}</dd></div>
        </dl>
        {flight && hotel && !compatible && (
          <p className="plan-error" role="status">Las fechas seleccionadas no coinciden. Cambia el vuelo o el hotel.</p>
        )}
        <button className="button button--primary plan-save" type="button"
          disabled={!compatible || saved || loading} onClick={() => submit(plan)}>
          {saved && <Check size={17} aria-hidden="true" />}
          {loading ? 'Actualizando…' : saved ? 'Itinerario guardado' : 'Guardar itinerario'}
        </button>
        {trip.plan && (
          <button className="text-button" type="button" disabled={loading} onClick={() => submit(null)}>
            Eliminar itinerario guardado
          </button>
        )}
        {feedback && <p className={feedback.error ? 'plan-error' : 'plan-feedback'}
          role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
        <small>Planificación simulada para una persona.</small>
      </aside>
    </div>
  )
}
