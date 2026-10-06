import type { Category } from '../types'
import { apiRequest } from './api'

export const categoryService = {
  list() {
    return apiRequest<Category[]>('/categories')
  },
}
