import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/utils/password'
import { generateTicketCode } from '../src/utils/ticket'

const prisma = new PrismaClient()

const CATEGORIES = ['Tecnología', 'Música', 'Deportes', 'Educación', 'Negocios', 'Cultura']

// Evently no separa asistentes de organizadores: solo existen USER y ADMIN.
const USERS = [
  { name: 'Administrador Evently', email: 'admin@evently.com', password: 'admin123', role: 'ADMIN' as const },
  { name: 'Usuario Demo', email: 'user@evently.com', password: 'user123', role: 'USER' as const },
  { name: 'Segundo Usuario', email: 'user2@evently.com', password: 'user123', role: 'USER' as const },
]

const IMAGES = {
  ai: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  hackathon: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  web: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  innovation: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  business: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
  music: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  culture: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=1200&q=80',
}

async function main() {
  const categories = new Map<string, string>()
  for (const name of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    categories.set(name, category.id)
  }

  const users = new Map<string, string>()
  for (const user of USERS) {
    const password = await hashPassword(user.password)
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, password, role: user.role },
      create: { name: user.name, email: user.email, password, role: user.role },
    })
    users.set(user.email, created.id)
  }

  const adminId = users.get('admin@evently.com')!
  const userId = users.get('user@evently.com')!
  const user2Id = users.get('user2@evently.com')!

  // Los datos de ejemplo de eventos, asistencias y favoritos se regeneran en cada seed.
  await prisma.favorite.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.event.deleteMany()

  const eventsData = [
    {
      title: 'Conferencia de Inteligencia Artificial',
      description:
        'Un encuentro para descubrir los últimos avances en inteligencia artificial, modelos de lenguaje y su impacto en la industria. Contaremos con ponentes nacionales e internacionales.',
      date: new Date('2026-11-15T12:00:00.000Z'),
      time: '09:00',
      location: 'Centro de Convenciones, Ciudad de México',
      image: IMAGES.ai,
      capacity: 200,
      price: 50,
      categoryId: categories.get('Tecnología')!,
      creatorId: userId,
    },
    {
      title: 'Hackathon Universitario',
      description:
        '48 horas para construir una solución tecnológica en equipo. Mentores, premios y mucho código. Ideal para estudiantes que quieran demostrar su talento.',
      date: new Date('2026-11-22T12:00:00.000Z'),
      time: '08:00',
      location: 'Universidad Central, Campus Norte',
      image: IMAGES.hackathon,
      capacity: 80,
      price: null,
      categoryId: categories.get('Tecnología')!,
      creatorId: userId,
    },
    {
      title: 'Taller de Desarrollo Web',
      description:
        'Taller práctico para aprender a construir aplicaciones web modernas con React, TypeScript y APIs REST. Incluye ejercicios guiados y proyecto final.',
      date: new Date('2026-12-01T12:00:00.000Z'),
      time: '16:00',
      location: 'Espacio Coworking Innovar, Guadalajara',
      image: IMAGES.web,
      capacity: 40,
      price: null,
      categoryId: categories.get('Educación')!,
      creatorId: userId,
    },
    {
      title: 'Feria de Innovación Tecnológica',
      description:
        'Exhibición de proyectos de robótica, domótica e innovación. Un espacio para conocer startups y prototipos que están transformando el futuro.',
      date: new Date('2026-12-10T12:00:00.000Z'),
      time: '11:00',
      location: 'Parque Tecnológico, Monterrey',
      image: IMAGES.innovation,
      capacity: 150,
      price: null,
      categoryId: categories.get('Tecnología')!,
      creatorId: adminId,
    },
    {
      title: 'Conferencia de Emprendimiento',
      description:
        'Conoce historias reales de emprendedores, aprende sobre financiamiento y construye tu red de contactos. Networking al finalizar el evento.',
      date: new Date('2027-01-20T12:00:00.000Z'),
      time: '18:00',
      location: 'Hotel Central, Puebla',
      image: IMAGES.business,
      capacity: 120,
      price: 30,
      categoryId: categories.get('Negocios')!,
      creatorId: userId,
    },
    {
      title: 'Festival de Música en Vivo',
      description:
        'Una noche con bandas locales e invitados especiales. Diversos géneros, buena energía y una experiencia sonora inolvidable.',
      date: new Date('2026-11-29T12:00:00.000Z'),
      time: '20:00',
      location: 'Foro Cultural, Ciudad de México',
      image: IMAGES.music,
      capacity: 300,
      price: null,
      categoryId: categories.get('Música')!,
      creatorId: adminId,
    },
    {
      title: 'Torneo de Fútbol Amistoso',
      description:
        'Torneo recreativo entre equipos universitarios. Inscripciones abiertas para jugadores y aficionados que quieran pasar un gran día deportivo.',
      date: new Date('2026-12-05T12:00:00.000Z'),
      time: '10:00',
      location: 'Canchas Municipales, Querétaro',
      image: IMAGES.sports,
      capacity: 60,
      price: null,
      categoryId: categories.get('Deportes')!,
      creatorId: user2Id,
    },
    {
      title: 'Exposición de Arte Urbano',
      description:
        'Recorrido guiado por murales y obras de artistas locales. Incluye taller de introducción al arte urbano para los asistentes.',
      date: new Date('2027-02-14T12:00:00.000Z'),
      time: '17:00',
      location: 'Galería Abierta, Oaxaca',
      image: IMAGES.culture,
      capacity: 90,
      price: null,
      categoryId: categories.get('Cultura')!,
      creatorId: adminId,
    },
  ]

  const createdEvents = []
  for (const event of eventsData) {
    const created = await prisma.event.create({ data: event })
    createdEvents.push(created)
  }

  const attendeeProfiles: Record<string, {
    firstName: string
    lastName: string
    email: string
    phone: string
    organization: string
  }> = {
    [userId]: {
      firstName: 'Usuario',
      lastName: 'Demo',
      email: 'user@evently.com',
      phone: '+51 999 888 777',
      organization: 'Universidad Nacional',
    },
    [adminId]: {
      firstName: 'Administrador',
      lastName: 'Evently',
      email: 'admin@evently.com',
      phone: '+51 999 111 222',
      organization: 'Evently',
    },
    [user2Id]: {
      firstName: 'Segundo',
      lastName: 'Usuario',
      email: 'user2@evently.com',
      phone: '+51 999 333 444',
      organization: 'Evently',
    },
  }

  const registrations = [
    { userId, eventId: createdEvents[0].id },
    { userId, eventId: createdEvents[2].id },
    { userId, eventId: createdEvents[5].id },
    { userId: adminId, eventId: createdEvents[1].id },
    { userId: user2Id, eventId: createdEvents[3].id },
  ]

  for (const registration of registrations) {
    await prisma.registration.create({
      data: {
        ...registration,
        ...attendeeProfiles[registration.userId],
        ticketCode: generateTicketCode(),
        status: 'CONFIRMED',
      },
    })
  }

  const favorites = [
    { userId, eventId: createdEvents[1].id },
    { userId, eventId: createdEvents[4].id },
    { userId, eventId: createdEvents[7].id },
    { userId: user2Id, eventId: createdEvents[6].id },
  ]

  for (const favorite of favorites) {
    await prisma.favorite.create({ data: favorite })
  }

  console.log('Seed completado:')
  console.log(`  - ${categories.size} categorías`)
  console.log(`  - ${users.size} usuarios`)
  console.log(`  - ${createdEvents.length} eventos`)
  console.log(`  - ${registrations.length} registros de asistencia`)
  console.log(`  - ${favorites.length} favoritos`)
}

main()
  .catch((error) => {
    console.error('Error al ejecutar el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
