import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AppError } from '../utils/AppError'
import { verifyToken } from '../utils/jwt'

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const

function extractToken(req: Request): string | null {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim()
  }
  return null
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req)
  if (!token) {
    return next(new AppError('No autorizado', 401))
  }

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: publicUserSelect,
    })
    if (!user) {
      return next(new AppError('No autorizado', 401))
    }
    req.user = user
    next()
  } catch {
    next(new AppError('Token inválido o expirado', 401))
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req)
  if (!token) {
    return next()
  }

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: publicUserSelect,
    })
    if (user) {
      req.user = user
    }
  } catch {
    // El token opcional inválido no bloquea la petición.
  }
  next()
}
