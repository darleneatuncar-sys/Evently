import cors from 'cors'
import express from 'express'
import { errorHandler } from './middlewares/errorHandler'
import { notFound } from './middlewares/notFound'
import routes from './routes'

const app = express()

app.use(cors())
// Límite amplio porque las imágenes del MVP se envían como data URL (base64).
app.use(express.json({ limit: '10mb' }))

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app
