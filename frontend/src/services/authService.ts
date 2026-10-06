import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types'
import { apiRequest } from './api'

export const authService = {
  register(payload: RegisterPayload) {
    return apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  login(payload: LoginPayload) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  me() {
    return apiRequest<User>('/auth/me')
  },
}
