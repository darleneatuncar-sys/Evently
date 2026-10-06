const GOOGLE_MAPS_API_KEY = (
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
)?.trim() ?? ''

const SCRIPT_ID = 'evently-google-maps'
const CALLBACK_NAME = '__eventlyGoogleMapsReady'

interface MapsBootstrap {
  importLibrary: (name: 'places') => Promise<google.maps.PlacesLibrary>
}

let bootstrapPromise: Promise<void> | null = null

export function isGoogleMapsConfigured(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0
}

function getBootstrap(): MapsBootstrap | undefined {
  return (window.google?.maps as unknown as MapsBootstrap | undefined) ?? undefined
}

function injectBootstrap(): Promise<void> {
  if (getBootstrap()?.importLibrary) {
    return Promise.resolve()
  }
  if (bootstrapPromise) {
    return bootstrapPromise
  }

  bootstrapPromise = new Promise<void>((resolve, reject) => {
    ;(window as unknown as Record<string, unknown>)[CALLBACK_NAME] = () => resolve()

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY,
    )}&v=weekly&loading=async&callback=${CALLBACK_NAME}`
    script.onerror = () => {
      bootstrapPromise = null
      reject(new Error('No se pudo cargar Google Maps Platform'))
    }
    document.head.appendChild(script)
  })

  return bootstrapPromise
}

export async function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (!isGoogleMapsConfigured()) {
    throw new Error('Google Maps API key no configurada')
  }
  await injectBootstrap()
  return getBootstrap()!.importLibrary('places')
}
