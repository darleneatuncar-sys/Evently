import type { Role } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AppError } from '../utils/AppError'
import { signToken } from '../utils/jwt'
import { comparePassword, hashPassword } from '../utils/password'
import type { LoginInput, RegisterInput } from '../validators/auth.validator'

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new AppError('Ya existe una cuenta con ese correo electrónico', 409)
  }

  const password = await hashPassword(input.password)
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password,
      role: 'USER',
    },
    select: publicUserSelect,
  })
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { events: true, registrations: true } },
    },
  })
}

export async function setUserRole(actorId: string, targetId: string, role: Role) {
  if (actorId === targetId) {
    throw new AppError('No puedes cambiar tu propio rol', 400)
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } })
  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }

  return prisma.user.update({
    where: { id: targetId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { events: true, registrations: true } },
    },
  })
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    throw new AppError('Credenciales inválidas', 401)
  }

  const isValid = await comparePassword(input.password, user.password)
  if (!isValid) {
    throw new AppError('Credenciales inválidas', 401)
  }

  const token = signToken({ userId: user.id, role: user.role })

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  }
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect })
  if (!user) {
    throw new AppError('Usuario no encontrado', 404)
  }
  return user
}
