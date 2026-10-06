import type { RegistrationPayload, RegistrationResult, UserEvent } from '../types'
import { apiRequest } from './api'

export const registrationService = {
  register(eventId: string, payload: RegistrationPayload) {
    return apiRequest<RegistrationResult>(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  cancel(eventId: string) {
    return apiRequest<void>(`/events/${eventId}/register`, { method: 'DELETE' })
  },

  myTickets() {
    return apiRequest<UserEvent[]>('/users/me/tickets')
  },
}
