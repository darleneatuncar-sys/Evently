import { apiRequest } from './api'

export interface PlaceSuggestion {
  label: string
  secondary: string
  latitude: number | null
  longitude: number | null
}

export const placeService = {
  search(input: string) {
    return apiRequest<PlaceSuggestion[]>(`/places?input=${encodeURIComponent(input)}`)
  },
}
