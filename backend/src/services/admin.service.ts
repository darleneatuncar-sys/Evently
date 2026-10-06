import { prisma } from '../config/prisma'

export async function getAdminStats() {
  const [users, events, registrations, confirmedRegistrations] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.registration.count(),
    prisma.registration.count({ where: { status: 'CONFIRMED' } }),
  ])

  return { users, events, registrations, confirmedRegistrations }
}
