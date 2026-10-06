import type { Request, Response } from 'express'
import * as placesService from '../services/places.service'

export async function searchPlaces(req: Request, res: Response) {
  const input = typeof req.query.input === 'string' ? req.query.input : ''
  const places = await placesService.searchPlaces(input)
  res.json({ success: true, data: places })
}
