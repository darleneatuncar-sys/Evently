import type { Event } from '../types'
import { apiRequest } from './api'

export const favoriteService = {
  add(eventId: string) {
    return apiRequest<void>(`/events/${eventId}/favorite`, { method: 'POST' })
  },

  remove(eventId: string) {
    return apiRequest<void>(`/events/${eventId}/favorite`, { method: 'DELETE' })
  },

  list() {
    return apiRequest<Event[]>('/users/me/favorites')
  },
}
