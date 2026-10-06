export interface PlaceSuggestion {
  label: string
  secondary: string
  latitude: number | null
  longitude: number | null
}

interface NominatimPlace {
  name?: string
  display_name: string
  lat: string
  lon: string
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'Evently/1.0 (proyecto academico; contacto: no-reply@evently.com)'
const CACHE_TTL_MS = 5 * 60 * 1000
const MIN_INTERVAL_MS = 1000

const cache = new Map<string, { at: number; data: PlaceSuggestion[] }>()
let lastRequestAt = 0

async function respectRateLimit(): Promise<void> {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt)
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait))
  }
  lastRequestAt = Date.now()
}

export async function searchPlaces(input: string): Promise<PlaceSuggestion[]> {
  const query = input.trim()
  if (query.length < 2) {
    return []
  }

  const cacheKey = query.toLowerCase()
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data
  }

  await respectRateLimit()

  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '6')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'es')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) {
      return []
    }

    const results = (await response.json()) as NominatimPlace[]
    const places = results.map((place) => {
      const label = place.name?.trim() || place.display_name.split(',')[0].trim()
      const secondary = place.display_name.replace(label, '').replace(/^,\s*/, '').trim()
      return {
        label,
        secondary: secondary || place.display_name,
        latitude: Number.isFinite(Number(place.lat)) ? Number(place.lat) : null,
        longitude: Number.isFinite(Number(place.lon)) ? Number(place.lon) : null,
      }
    })

    cache.set(cacheKey, { at: Date.now(), data: places })
    return places
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}
