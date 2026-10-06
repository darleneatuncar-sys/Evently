import { AppError } from '../utils/AppError'

export interface RecommendationInput {
  title: string
  description: string
  category?: string
  location?: string
}

export function validateRecommendation(body: unknown): RecommendationInput {
  const b = (body ?? {}) as Record<string, unknown>
  const title = typeof b.title === 'string' ? b.title.trim() : ''

  if (!title) throw new AppError('El título del evento es obligatorio')

  return {
    title,
    description: typeof b.description === 'string' ? b.description.trim() : '',
    category: typeof b.category === 'string' ? b.category.trim() : undefined,
    location: typeof b.location === 'string' ? b.location.trim() : undefined,
  }
}
