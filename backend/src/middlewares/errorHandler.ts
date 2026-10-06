import { Prisma } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/AppError'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un registro con esos datos',
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
      })
    }
  }

  // Errores del body-parser (p. ej. datos demasiado grandes o JSON inválido).
  const parseError = err as { status?: number; statusCode?: number; type?: string }
  const statusCode = parseError.status ?? parseError.statusCode
  if (statusCode === 413 || parseError.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Los datos enviados son demasiado grandes. Prueba con una imagen más pequeña.',
    })
  }
  if (statusCode === 400 && parseError.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'No se pudieron interpretar los datos enviados.',
    })
  }

  console.error(err)
  res.status(500).json({
    success: false,
    message: 'Ha ocurrido un error en el servidor',
  })
}
