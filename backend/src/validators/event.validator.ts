import { AppError } from '../utils/AppError'

export interface EventInput {
  title: string
  description: string
  date: Date
  time: string
  location: string
  placeId: string | null
  latitude: number | null
  longitude: number | null
  image: string | null
  capacity: number
  price: number | null
  categoryId: string
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function validateEventInput(body: unknown): EventInput {
  const b = (body ?? {}) as Record<string, unknown>
  const title = asString(b.title)
  const description = asString(b.description)
  const dateRaw = asString(b.date)
  const time = asString(b.time)
  const location = asString(b.location)
  const categoryId = asString(b.categoryId)
  const image = asString(b.image)

  if (!title) throw new AppError('El título es obligatorio')
  if (!description) throw new AppError('La descripción es obligatoria')
  if (!location) throw new AppError('La ubicación es obligatoria')
  if (!categoryId) throw new AppError('La categoría es obligatoria')
  if (!time) throw new AppError('La hora es obligatoria')
  if (!dateRaw || Number.isNaN(Date.parse(dateRaw))) {
    throw new AppError('La fecha no es válida')
  }

  const capacity = Number(b.capacity)
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new AppError('La capacidad debe ser un número entero mayor a 0')
  }

  let price = asOptionalNumber(b.price)
  if (price !== null && price < 0) {
    throw new AppError('El precio no puede ser negativo')
  }
  if (price !== null && price === 0) {
    price = null
  }

  return {
    title,
    description,
    date: new Date(`${dateRaw.slice(0, 10)}T12:00:00.000Z`),
    time,
    location,
    placeId: asString(b.placeId) || null,
    latitude: asOptionalNumber(b.latitude),
    longitude: asOptionalNumber(b.longitude),
    image: image || null,
    capacity,
    price,
    categoryId,
  }
}
