import { Router } from 'express'
import * as userController from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'

const router = Router()

router.get('/me/tickets', authMiddleware, userController.myTickets)
router.get('/me/favorites', authMiddleware, userController.myFavorites)
router.get('/me/events', authMiddleware, userController.myEvents)

router.get('/', authMiddleware, requireRole('ADMIN'), userController.listUsers)
router.patch('/:id/role', authMiddleware, requireRole('ADMIN'), userController.updateUserRole)

export default router
