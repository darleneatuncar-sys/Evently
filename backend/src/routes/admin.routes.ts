import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'

const router = Router()

router.use(authMiddleware, requireRole('ADMIN'))

router.get('/stats', adminController.stats)

export default router
