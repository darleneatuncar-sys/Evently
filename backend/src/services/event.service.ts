import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import type { AuthUser } from '../types'
import { AppError } from '../utils/AppError'
import type { EventInput } from '../validators/event.validator'

export const eventInclude = {
  category: { select: { id: true, name: true } },
  creator: { select: { id: true, name: true, email: true } },
  _count: { select: { registrations: { where: { status: 'CONFIRMED' as const } } } },
}

export type EventWithRelations = Prisma.EventGetPayload<{ include: typeof eventInclude }>

export function toEventDTO(event: EventWithRelations) {
  const { _count, ...rest } = event
  return { ...rest, registeredCount: _count.registrations }
}

export interface EventFilters {
  search?: string
  location?: string
  categoryId?: string
  sort?: string
  limit?: number
}

const ACCENT_FROM = 'áàäâãéèëêíìïîóòöôõúùüûñç'
const ACCENT_TO = 'aaaaaeeeeiiiiooooouuuunc'

async function findMatchingEventIds(filters: EventFilters): Promise<string[]> {
  const conditions: Prisma.Sql[] = []

  if (filters.search) {
    const term = filters.search
    conditions.push(Prisma.sql`(
      translate(lower(e."title"), ${ACCENT_FROM}, ${ACCENT_TO}) LIKE '%' || translate(lower(${term}), ${ACCENT_FROM}, ${ACCENT_TO}) || '%'
      OR translate(lower(e."description"), ${ACCENT_FROM}, ${ACCENT_TO}) LIKE '%' || translate(lower(${term}), ${ACCENT_FROM}, ${ACCENT_TO}) || '%'
      OR translate(lower(e."location"), ${ACCENT_FROM}, ${ACCENT_TO}) LIKE '%' || translate(lower(${term}), ${ACCENT_FROM}, ${ACCENT_TO}) || '%'
      OR translate(lower(c."name"), ${ACCENT_FROM}, ${ACCENT_TO}) LIKE '%' || translate(lower(${term}), ${ACCENT_FROM}, ${ACCENT_TO}) || '%'
    )`)
  }

  if (filters.location) {
    const term = filters.location
    conditions.push(
      Prisma.sql`translate(lower(e."location"), ${ACCENT_FROM}, ${ACCENT_TO}) LIKE '%' || translate(lower(${term}), ${ACCENT_FROM}, ${ACCENT_TO}) || '%'`,
    )
  }

  if (conditions.length === 0) {
    return []
  }

  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT e."id"
    FROM "Event" e
    JOIN "Category" c ON c."id" = e."categoryId"
    WHERE ${Prisma.join(conditions, ' AND ')}
  `)

  return rows.map((row) => row.id)
}

function resolveOrderBy(sort?: string): Prisma.EventOrderByWithRelationInput {
  switch (sort) {
    case 'date_desc':
      return { date: 'desc' }
    case 'title_asc':
      return { title: 'asc' }
    case 'recent':
      return { createdAt: 'desc' }
    case 'date_asc':
    default:
      return { date: 'asc' }
  }
}

export async function listEvents(filters: EventFilters) {
  const where: Prisma.EventWhereInput = {}

  if (filters.search || filters.location) {
    where.id = { in: await findMatchingEventIds(filters) }
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  const events = await prisma.event.findMany({
    where,
    include: eventInclude,
    orderBy: resolveOrderBy(filters.sort),
    take: filters.limit,
  })

  return events.map(toEventDTO)
}

export async function getEventById(id: string, userId?: string) {
  const event = await prisma.event.findUnique({ where: { id }, include: eventInclude })
  if (!event) {
    throw new AppError('Evento no encontrado', 404)
  }

  let isRegistered = false
  if (userId) {
    const registration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
    })
    isRegistered = registration?.status === 'CONFIRMED'
  }

  return { ...toEventDTO(event), isRegistered }
}

export async function createEvent(creatorId: string, input: EventInput) {
  const event = await prisma.event.create({
    data: { ...input, creatorId },
    include: eventInclude,
  })
  return toEventDTO(event)
}

async function findOwnedEvent(id: string, user: AuthUser) {
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) {
    throw new AppError('Evento no encontrado', 404)
  }
  if (event.creatorId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('No puedes administrar un evento que no te pertenece', 403)
  }
  return event
}

export async function updateEvent(id: string, user: AuthUser, input: EventInput) {
  await findOwnedEvent(id, user)
  const event = await prisma.event.update({
    where: { id },
    data: input,
    include: eventInclude,
  })
  return toEventDTO(event)
}

export async function deleteEvent(id: string, user: AuthUser) {
  await findOwnedEvent(id, user)
  await prisma.event.delete({ where: { id } })
}

export async function listCreatedEvents(creatorId: string) {
  const events = await prisma.event.findMany({
    where: { creatorId },
    include: eventInclude,
    orderBy: { date: 'asc' },
  })
  return events.map(toEventDTO)
}

export async function listEventAttendees(id: string, user: AuthUser) {
  await findOwnedEvent(id, user)

  const registrations = await prisma.registration.findMany({
    where: { eventId: id, status: 'CONFIRMED' },
    orderBy: { registeredAt: 'asc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return registrations.map((registration) => ({
    id: registration.id,
    registeredAt: registration.registeredAt,
    status: registration.status,
    user: registration.user,
  }))
}
