import { Router } from 'express'
import * as aiController from '../controllers/ai.controller'

const router = Router()

router.post('/recommendation', aiController.recommendation)

export default router
