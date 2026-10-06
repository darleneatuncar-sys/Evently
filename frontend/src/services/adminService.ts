import type { AdminStats } from '../types'
import { apiRequest } from './api'

export const adminService = {
  stats() {
    return apiRequest<AdminStats>('/admin/stats')
  },
}
