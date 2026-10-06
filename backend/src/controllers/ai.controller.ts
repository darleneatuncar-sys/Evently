import type { Request, Response } from 'express'
import * as aiService from '../services/ai.service'
import { validateRecommendation } from '../validators/ai.validator'

export async function recommendation(req: Request, res: Response) {
  const input = validateRecommendation(req.body)
  const result = await aiService.getEventRecommendation(input)
  res.json({ success: true, data: result })
}
