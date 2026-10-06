import { prisma } from '../config/prisma'
import { AppError } from '../utils/AppError'
import { generateTicketCode } from '../utils/ticket'
import type { RegistrationInput } from '../validators/registration.validator'
import { sendTicketEmail } from './email.service'
import { toEventDTO, type EventWithRelations } from './event.service'
import { generateTicketQr } from './qr.service'

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

function formatEventDate(date: Date): string {
  return `${date.getUTCDate()} de ${MONTHS[date.getUTCMonth()]} de ${date.getUTCFullYear()}`
}

export async function registerToEvent(userId: string, eventId: string, input: RegistrationInput) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } } },
  })
  if (!event) {
    throw new AppError('Evento no encontrado', 404)
  }

  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  })

  if (existing?.status === 'CONFIRMED') {
    throw new AppError('Ya estás registrado en este evento', 409)
  }

  if (event._count.registrations >= event.capacity) {
    throw new AppError('El evento ha alcanzado su capacidad máxima', 400)
  }

  const details = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    organization: input.organization,
    status: 'CONFIRMED' as const,
    registeredAt: new Date(),
  }

  const registration = existing
    ? await prisma.registration.update({ where: { id: existing.id }, data: details })
    : await prisma.registration.create({
        data: { userId, eventId, ticketCode: generateTicketCode(), ...details },
      })

  const emailSent = await sendTicketEmail({
    to: input.email,
    attendeeName: `${input.firstName} ${input.lastName}`.trim(),
    eventTitle: event.title,
    eventDate: formatEventDate(event.date),
    eventTime: event.time,
    eventLocation: event.location,
    ticketCode: registration.ticketCode,
  })

  return {
    registrationId: registration.id,
    ticketCode: registration.ticketCode,
    emailSent,
  }
}

export async function cancelRegistration(userId: string, eventId: string) {
  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  })
  if (!existing || existing.status === 'CANCELLED') {
    throw new AppError('No estás registrado en este evento', 404)
  }

  return prisma.registration.update({
    where: { id: existing.id },
    data: { status: 'CANCELLED' },
  })
}

export async function listUserTickets(userId: string) {
  const registrations = await prisma.registration.findMany({
    where: { userId, status: 'CONFIRMED' },
    orderBy: { event: { date: 'asc' } },
    include: {
      event: {
        include: {
          category: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
          _count: { select: { registrations: { where: { status: 'CONFIRMED' } } } },
        },
      },
    },
  })

  return Promise.all(
    registrations.map(async (registration) => ({
      ...toEventDTO(registration.event as EventWithRelations),
      registrationId: registration.id,
      registrationStatus: registration.status,
      registeredAt: registration.registeredAt,
      ticketCode: registration.ticketCode,
      attendee: {
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        phone: registration.phone,
        organization: registration.organization,
      },
      qrCode: await generateTicketQr(registration.ticketCode),
    })),
  )
}
