import type { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { AppError } from '../utils/AppError'
import * as eventService from '../services/event.service'
import * as favoriteService from '../services/favorite.service'
import * as registrationService from '../services/registration.service'

export async function myTickets(req: Request, res: Response) {
  const events = await registrationService.listUserTickets(req.user!.id)
  res.json({ success: true, data: events })
}

export async function myFavorites(req: Request, res: Response) {
  const events = await favoriteService.listFavorites(req.user!.id)
  res.json({ success: true, data: events })
}

export async function myEvents(req: Request, res: Response) {
  const events = await eventService.listCreatedEvents(req.user!.id)
  res.json({ success: true, data: events })
}

export async function listUsers(_req: Request, res: Response) {
  const users = await authService.listUsers()
  res.json({ success: true, data: users })
}

export async function updateUserRole(req: Request<{ id: string }>, res: Response) {
  const role = req.body?.role
  if (role !== 'USER' && role !== 'ADMIN') {
    throw new AppError('Rol inválido', 400)
  }

  const user = await authService.setUserRole(req.user!.id, req.params.id, role)
  res.json({ success: true, data: user, message: 'Rol actualizado correctamente' })
}
