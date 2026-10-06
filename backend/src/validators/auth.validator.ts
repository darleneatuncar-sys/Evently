import { AppError } from '../utils/AppError'

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegister(body: unknown): RegisterInput {
  const b = (body ?? {}) as Record<string, unknown>
  const name = typeof b.name === 'string' ? b.name.trim() : ''
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : ''
  const password = typeof b.password === 'string' ? b.password : ''

  if (!name) throw new AppError('El nombre es obligatorio')
  if (!EMAIL_REGEX.test(email)) throw new AppError('El correo electrónico no es válido')
  if (password.length < 6) throw new AppError('La contraseña debe tener al menos 6 caracteres')

  return { name, email, password }
}

export function validateLogin(body: unknown): LoginInput {
  const b = (body ?? {}) as Record<string, unknown>
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : ''
  const password = typeof b.password === 'string' ? b.password : ''

  if (!EMAIL_REGEX.test(email)) throw new AppError('El correo electrónico no es válido')
  if (!password) throw new AppError('La contraseña es obligatoria')

  return { email, password }
}
