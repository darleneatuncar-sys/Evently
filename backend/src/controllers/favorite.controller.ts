import type { Request, Response } from 'express'
import * as favoriteService from '../services/favorite.service'

type IdParams = { id: string }

export async function addFavorite(req: Request<IdParams>, res: Response) {
  await favoriteService.addFavorite(req.user!.id, req.params.id)
  res.status(201).json({ success: true, message: 'Evento agregado a Me gusta' })
}

export async function removeFavorite(req: Request<IdParams>, res: Response) {
  await favoriteService.removeFavorite(req.user!.id, req.params.id)
  res.json({ success: true, message: 'Evento eliminado de Me gusta' })
}
