export type Role = 'USER' | 'ADMIN'

export type RegistrationStatus = 'CONFIRMED' | 'CANCELLED'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface EventCreator {
  id: string
  name: string
  email?: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  placeId: string | null
  latitude: number | null
  longitude: number | null
  image: string | null
  capacity: number
  price: number | null
  creatorId: string
  categoryId: string
  createdAt: string
  updatedAt: string
  category: Pick<Category, 'id' | 'name'>
  creator: EventCreator
  registeredCount: number
  isRegistered?: boolean
}

export interface TicketAttendee {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string | null
}

export interface UserEvent extends Event {
  registrationId: string
  registrationStatus: RegistrationStatus
  registeredAt: string
  ticketCode: string
  attendee: TicketAttendee
  qrCode: string
}

export interface Attendee {
  id: string
  registeredAt: string
  status: RegistrationStatus
  user: {
    id: string
    name: string
    email: string
  }
}

export interface AIRecommendation {
  recommendation: string
  source: 'ai' | 'fallback'
}

export interface EventPayload {
  title: string
  description: string
  date: string
  time: string
  location: string
  placeId?: string | null
  latitude?: number | null
  longitude?: number | null
  image: string
  capacity: number
  price?: number | null
  categoryId: string
}

export interface AdminStats {
  users: number
  events: number
  registrations: number
  confirmedRegistrations: number
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
  _count: {
    events: number
    registrations: number
  }
}

export interface RegistrationPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization?: string
}

export interface RegistrationResult {
  registrationId: string
  ticketCode: string
  emailSent: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface Favorite {
  id: string
  userId: string
  eventId: string
  createdAt: string
}
