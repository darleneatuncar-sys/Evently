import type { AIRecommendation } from '../types'
import { apiRequest } from './api'

export interface RecommendationPayload {
  title: string
  description: string
  category?: string
  location?: string
}

export const aiService = {
  recommend(payload: RecommendationPayload) {
    return apiRequest<AIRecommendation>('/ai/recommendation', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
