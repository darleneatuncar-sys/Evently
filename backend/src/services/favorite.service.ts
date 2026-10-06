import { prisma } from '../config/prisma'
import { AppError } from '../utils/AppError'
import { eventInclude, toEventDTO, type EventWithRelations } from './event.service'

export async function addFavorite(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    throw new AppError('Evento no encontrado', 404)
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_eventId: { userId, eventId } },
  })
  if (existing) {
    return existing
  }

  return prisma.favorite.create({ data: { userId, eventId } })
}

export async function removeFavorite(userId: string, eventId: string) {
  await prisma.favorite.deleteMany({ where: { userId, eventId } })
}

export async function listFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { event: { include: eventInclude } },
  })

  return favorites.map((favorite) => toEventDTO(favorite.event as EventWithRelations))
}
