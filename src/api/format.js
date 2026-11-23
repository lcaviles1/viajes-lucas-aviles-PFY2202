const currency = new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
})
const date = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
})

export const money = (value) => currency.format(value)
export const shortDate = (value) => date.format(new Date(value))
export const nightsBetween = (start, end) => (Date.parse(end) - Date.parse(start)) / 86400000

export function destinationPhoto(id) {
  return `${import.meta.env.BASE_URL}destinos/${id}.webp`
}
