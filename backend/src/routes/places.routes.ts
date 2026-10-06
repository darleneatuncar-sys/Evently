import { Router } from 'express'
import * as placeController from '../controllers/place.controller'

const router = Router()

router.get('/', placeController.searchPlaces)

export default router
