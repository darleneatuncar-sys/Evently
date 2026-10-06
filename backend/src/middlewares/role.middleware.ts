import type { Role } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError'

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('No autenticado', 401))
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para realizar esta acción', 403))
    }
    next()
  }
}
