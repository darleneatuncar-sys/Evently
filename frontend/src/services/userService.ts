import type { AdminUser, Role } from '../types'
import { apiRequest } from './api'

export const userService = {
  list() {
    return apiRequest<AdminUser[]>('/users')
  },

  updateRole(id: string, role: Role) {
    return apiRequest<AdminUser>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  },
}
