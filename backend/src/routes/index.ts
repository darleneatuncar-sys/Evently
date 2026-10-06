import { Router } from 'express'
import adminRoutes from './admin.routes'
import aiRoutes from './ai.routes'
import authRoutes from './auth.routes'
import categoryRoutes from './category.routes'
import eventRoutes from './event.routes'
import healthRoutes from './health.routes'
import placesRoutes from './places.routes'
import userRoutes from './user.routes'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)
router.use('/events', eventRoutes)
router.use('/places', placesRoutes)
router.use('/users', userRoutes)
router.use('/admin', adminRoutes)
router.use('/ai', aiRoutes)

export default router
