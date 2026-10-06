import type { Attendee, Event, EventPayload } from '../types'
import { apiRequest } from './api'

export interface EventQuery {
  search?: string
  location?: string
  categoryId?: string
  sort?: string
  limit?: number
}

function buildQuery(query: EventQuery): string {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.location) params.set('location', query.location)
  if (query.categoryId) params.set('categoryId', query.categoryId)
  if (query.sort) params.set('sort', query.sort)
  if (query.limit) params.set('limit', String(query.limit))
  const value = params.toString()
  return value ? `?${value}` : ''
}

export const eventService = {
  list(query: EventQuery = {}) {
    return apiRequest<Event[]>(`/events${buildQuery(query)}`)
  },

  getById(id: string) {
    return apiRequest<Event>(`/events/${id}`)
  },

  create(payload: EventPayload) {
    return apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(id: string, payload: EventPayload) {
    return apiRequest<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  remove(id: string) {
    return apiRequest<void>(`/events/${id}`, { method: 'DELETE' })
  },

  attendees(id: string) {
    return apiRequest<Attendee[]>(`/events/${id}/attendees`)
  },

  mine() {
    return apiRequest<Event[]>('/users/me/events')
  },
}
