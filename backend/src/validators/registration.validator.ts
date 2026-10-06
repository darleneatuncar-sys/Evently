import { AppError } from '../utils/AppError'

export interface RegistrationInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string | null
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegistrationInput(body: unknown): RegistrationInput {
  const b = (body ?? {}) as Record<string, unknown>
  const firstName = typeof b.firstName === 'string' ? b.firstName.trim() : ''
  const lastName = typeof b.lastName === 'string' ? b.lastName.trim() : ''
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : ''
  const phone = typeof b.phone === 'string' ? b.phone.trim() : ''
  const organization = typeof b.organization === 'string' ? b.organization.trim() : ''

  if (!firstName) throw new AppError('Ingresa tus nombres.')
  if (!lastName) throw new AppError('Ingresa tus apellidos.')
  if (!EMAIL_REGEX.test(email)) throw new AppError('Ingresa un correo válido.')

  const phoneDigits = phone.replace(/\D/g, '')
  if (phoneDigits.length < 6 || phoneDigits.length > 15) {
    throw new AppError('Ingresa un número de teléfono válido.')
  }

  return {
    firstName,
    lastName,
    email,
    phone,
    organization: organization || null,
  }
}
