import type { Request, Response } from 'express'
import * as eventService from '../services/event.service'
import { validateEventInput } from '../validators/event.validator'

type IdParams = { id: string }

export async function listEvents(req: Request, res: Response) {
  const events = await eventService.listEvents({
    search: typeof req.query.search === 'string' ? req.query.search.trim() : undefined,
    location: typeof req.query.location === 'string' ? req.query.location.trim() : undefined,
    categoryId: typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined,
    sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    limit: typeof req.query.limit === 'string' ? Number(req.query.limit) || undefined : undefined,
  })
  res.json({ success: true, data: events })
}

export async function getEvent(req: Request<IdParams>, res: Response) {
  const event = await eventService.getEventById(req.params.id, req.user?.id)
  res.json({ success: true, data: event })
}

export async function createEvent(req: Request, res: Response) {
  const input = validateEventInput(req.body)
  const event = await eventService.createEvent(req.user!.id, input)
  res.status(201).json({ success: true, data: event })
}

export async function updateEvent(req: Request<IdParams>, res: Response) {
  const input = validateEventInput(req.body)
  const event = await eventService.updateEvent(req.params.id, req.user!, input)
  res.json({ success: true, data: event })
}

export async function deleteEvent(req: Request<IdParams>, res: Response) {
  await eventService.deleteEvent(req.params.id, req.user!)
  res.json({ success: true, message: 'Evento eliminado correctamente' })
}

export async function listAttendees(req: Request<IdParams>, res: Response) {
  const attendees = await eventService.listEventAttendees(req.params.id, req.user!)
  res.json({ success: true, data: attendees })
}
