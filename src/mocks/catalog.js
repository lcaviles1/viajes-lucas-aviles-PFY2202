export const destinations = [
  {
    id: 'machu-picchu', name: 'Machu Picchu', country: 'Perú', region: 'Sudamérica', category: 'Cultura',
    description: 'Ruinas incas entre montañas, caminos de piedra y mercados andinos.',
    activities: ['Santuario inca', 'Valle Sagrado', 'Mercados de Cusco'],
    imageAlt: 'Ciudadela de Machu Picchu rodeada de montañas verdes',
  },
  {
    id: 'patagonia', name: 'Patagonia', country: 'Chile', region: 'Sudamérica', category: 'Naturaleza',
    description: 'Senderos australes, lagos turquesa y montañas que dominan el paisaje.',
    activities: ['Torres del Paine', 'Lago Grey', 'Fauna austral'],
    imageAlt: 'Montañas y paisaje natural de la Patagonia chilena',
  },
  {
    id: 'kyoto', name: 'Kioto', country: 'Japón', region: 'Asia', category: 'Cultura',
    description: 'Templos tranquilos, jardines históricos y calles para descubrir a pie.',
    activities: ['Fushimi Inari', 'Arashiyama', 'Barrio de Gion'],
    imageAlt: 'Paisaje urbano tradicional de Kioto',
  },
  {
    id: 'lisboa', name: 'Lisboa', country: 'Portugal', region: 'Europa', category: 'Cultura',
    description: 'Miradores sobre el Tajo, tranvías y barrios de fachadas cubiertas de azulejos.',
    activities: ['Barrio de Alfama', 'Tranvía 28', 'Pasteles de Belém'],
    imageAlt: 'Casas y calles de Lisboa',
  },
  {
    id: 'cartagena', name: 'Cartagena', country: 'Colombia', region: 'Sudamérica', category: 'Playa',
    description: 'Una ciudad amurallada de balcones floridos, con islas a corta distancia.',
    activities: ['Centro histórico', 'Islas del Rosario', 'Barrio Getsemaní'],
    imageAlt: 'Arquitectura colorida de Cartagena de Indias',
  },
  {
    id: 'reykjavik', name: 'Reikiavik', country: 'Islandia', region: 'Europa', category: 'Naturaleza',
    description: 'Una base para recorrer cascadas, campos de lava y piscinas geotermales.',
    activities: ['Círculo Dorado', 'Aguas termales', 'Cascada Gullfoss'],
    imageAlt: 'Vista de Reikiavik, Islandia',
  },
]

const routes = {
  'machu-picchu': {
    airport: 'CUZ', gateway: 'Cusco', duration: '6 h 10 min', stops: 1, fare: 319900, rate: 41900,
    hotels: ['Patio de los Andes', 'Casa del Valle', 'Mirador de Cusco'],
  },
  patagonia: {
    airport: 'PNT', gateway: 'Puerto Natales', duration: '3 h 15 min', stops: 0, fare: 144900, rate: 66900,
    hotels: ['Casa del Estrecho', 'Refugio Austral', 'Lago y Cordillera'],
  },
  kyoto: {
    airport: 'KIX', gateway: 'Osaka', duration: '32 h 40 min', arrivalOffset: 2, stops: 2, fare: 1149900, rate: 71900,
    hotels: ['Casa de Higashiyama', 'Jardín de Kioto', 'Posada del Kamo'],
  },
  lisboa: {
    airport: 'LIS', gateway: 'Lisboa', duration: '17 h 45 min', arrivalOffset: 1, stops: 1, fare: 679900, rate: 62900,
    hotels: ['Casa del Mirador', 'Patio de Alfama', 'Estancia del Tajo'],
  },
  cartagena: {
    airport: 'CTG', gateway: 'Cartagena', duration: '8 h 25 min', stops: 1, fare: 352900, rate: 48900,
    hotels: ['Patio de Getsemaní', 'Casa del Mar', 'Posada de las Murallas'],
  },
  reykjavik: {
    airport: 'KEF', gateway: 'Keflavík', duration: '23 h 10 min', arrivalOffset: 1, stops: 2, fare: 889900, rate: 103900,
    hotels: ['Casa del Puerto', 'Refugio de Lava', 'Mirador del Norte'],
  },
}

const now = new Date()
const airlines = ['Aerolínea Horizonte', 'Aerolínea Meridiano', 'Aerolínea Travesía']

function dateInNextMonth(day) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, day))
    .toISOString().slice(0, 10)
}

export function findOptions(destinationId) {
  const route = Object.hasOwn(routes, destinationId) ? routes[destinationId] : null
  if (!route) return null

  const flights = airlines.map((airline, index) => {
    const start = 5 + index * 7
    const arrival = start + (route.arrivalOffset ?? 0)
    return {
      id: `${destinationId}-f${index + 1}`, airline, origin: 'SCL', airport: route.airport,
      gateway: route.gateway, duration: route.duration, stops: route.stops,
      departureDate: dateInNextMonth(start), arrivalDate: dateInNextMonth(arrival),
      returnDate: dateInNextMonth(arrival + 5),
      price: route.fare + index * 27000, availableSeats: [7, 3, 0][index],
    }
  })

  const hotels = route.hotels.map((name, index) => ({
    id: `${destinationId}-h${index + 1}`, name, stars: [3, 4, 4][index],
    roomType: ['Habitación estándar', 'Habitación superior', 'Habitación con vista'][index],
    checkIn: flights[index].arrivalDate, checkOut: flights[index].returnDate,
    pricePerNight: route.rate + index * 15300, availableRooms: [5, 2, 0][index],
  }))

  return { id: destinationId, flights, hotels }
}
