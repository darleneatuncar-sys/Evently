import { Router } from 'express'
import * as eventController from '../controllers/event.controller'
import * as favoriteController from '../controllers/favorite.controller'
import * as registrationController from '../controllers/registration.controller'
import { authMiddleware, optionalAuth } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', eventController.listEvents)
router.get('/:id/attendees', authMiddleware, eventController.listAttendees)
router.get('/:id', optionalAuth, eventController.getEvent)

router.post('/', authMiddleware, eventController.createEvent)
router.put('/:id', authMiddleware, eventController.updateEvent)
router.delete('/:id', authMiddleware, eventController.deleteEvent)

router.post('/:id/register', authMiddleware, registrationController.registerToEvent)
router.delete('/:id/register', authMiddleware, registrationController.cancelRegistration)

router.post('/:id/favorite', authMiddleware, favoriteController.addFavorite)
router.delete('/:id/favorite', authMiddleware, favoriteController.removeFavorite)

export default router
