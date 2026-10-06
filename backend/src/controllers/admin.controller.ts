import type { Request, Response } from 'express'
import * as adminService from '../services/admin.service'

export async function stats(_req: Request, res: Response) {
  const data = await adminService.getAdminStats()
  res.json({ success: true, data })
}
