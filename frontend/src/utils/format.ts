const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const SHORT_MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

function parseDateParts(isoDate: string): { day: number; monthIndex: number; year: number } {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  return { day, monthIndex: month - 1, year }
}

export function formatEventDate(isoDate: string, short = false): string {
  const { day, monthIndex, year } = parseDateParts(isoDate)
  const month = short ? SHORT_MONTHS[monthIndex] : MONTHS[monthIndex]
  if (short) {
    return `${day} ${month} ${year}`
  }
  return `${day} de ${month} de ${year}`
}

export function formatEventTime(time: string): string {
  return time
}

export function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10)
}

export function isEventFull(capacity: number, registeredCount: number): boolean {
  return registeredCount >= capacity
}

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'Usuario',
  ADMIN: 'Administrador',
}

export function formatRole(role: string): string {
  return ROLE_LABELS[role] ?? role
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price <= 0) {
    return 'Gratis'
  }
  return `S/ ${price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
