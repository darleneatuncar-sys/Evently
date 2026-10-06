import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { placeService } from '../services/placeService'
import { isGoogleMapsConfigured, loadPlacesLibrary } from '../utils/googleMaps'
import { IconMapPin } from './icons'

export interface SelectedLocation {
  /** Dirección completa formateada (útil para la ubicación de un evento). */
  location: string
  /** Etiqueta corta (ciudad/localidad) usada para filtrar búsquedas. */
  city: string
  placeId: string | null
  latitude: number | null
  longitude: number | null
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (selection: SelectedLocation) => void
  onFocus?: () => void
  placeholder?: string
  className?: string
  wrapperClassName?: string
  menuClassName?: string
  id?: string
}

interface Suggestion {
  key: string
  primary: string
  secondary: string
  address?: string
  placeId: string | null
  prediction?: google.maps.places.PlacePrediction
}

const DEBOUNCE_MS = 250
const MIN_CHARS = 2

function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  onFocus,
  placeholder = 'Buscar una ubicación',
  className = '',
  wrapperClassName = '',
  menuClassName = 'left-0 right-0',
  id,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)
  const requestIdRef = useRef(0)
  const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(
    () => () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    },
    [],
  )

  const fetchSuggestions = useCallback(async (input: string) => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      if (isGoogleMapsConfigured()) {
        try {
          const places = await loadPlacesLibrary()
          if (!tokenRef.current) {
            tokenRef.current = new places.AutocompleteSessionToken()
          }
          const { suggestions: results } =
            await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input,
              sessionToken: tokenRef.current,
            })
          if (requestId !== requestIdRef.current) return

          const mapped = results
            .map((result) => result.placePrediction)
            .filter((prediction): prediction is google.maps.places.PlacePrediction =>
              Boolean(prediction),
            )
            .map((prediction) => ({
              key: prediction.placeId,
              primary: prediction.mainText?.text ?? prediction.text.text,
              secondary: prediction.secondaryText?.text ?? '',
              placeId: prediction.placeId,
              prediction,
            }))

          setSuggestions(mapped)
          setOpen(mapped.length > 0)
          setActiveIndex(-1)
          return
        } catch (error) {
          console.error('Google Places no disponible, usando ubicaciones guardadas:', error)
        }
      }

      // Respaldo sin Google: búsqueda mundial de lugares (OpenStreetMap/Nominatim).
      const places = await placeService.search(input)
      if (requestId !== requestIdRef.current) return
      const mapped = places.map((place) => ({
        key: `${place.label}-${place.latitude}-${place.longitude}`,
        primary: place.label,
        secondary: place.secondary,
        address: place.secondary ? `${place.label}, ${place.secondary}` : place.label,
        placeId: null,
      }))
      setSuggestions(mapped)
      setOpen(mapped.length > 0)
      setActiveIndex(-1)
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      console.error(error)
      setSuggestions([])
      setOpen(false)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    onChange(next)

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (next.trim().length < MIN_CHARS) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = window.setTimeout(() => {
      void fetchSuggestions(next.trim())
    }, DEBOUNCE_MS)
  }

  const selectSuggestion = async (suggestion: Suggestion) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    setOpen(false)
    setSuggestions([])
    setActiveIndex(-1)

    const city = suggestion.primary
    let location = suggestion.address ?? suggestion.primary
    let placeId = suggestion.placeId
    let latitude: number | null = null
    let longitude: number | null = null

    if (suggestion.prediction) {
      try {
        const place = suggestion.prediction.toPlace()
        await place.fetchFields({ fields: ['id', 'formattedAddress', 'location'] })
        placeId = place.id ?? placeId
        location = place.formattedAddress ?? location
        if (place.location) {
          latitude = place.location.lat()
          longitude = place.location.lng()
        }
      } catch (error) {
        console.error(error)
      }
    }

    tokenRef.current = null
    // El input muestra la etiqueta corta (ciudad) para que el filtro haga match
    // con la ubicación de los eventos; la dirección completa va en onSelect.
    onChange(city)
    onSelect?.({ location, city, placeId, latitude, longitude })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault()
        void selectSuggestion(suggestions[activeIndex])
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${wrapperClassName}`}>
      <input
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          onFocus?.()
          if (suggestions.length > 0) setOpen(true)
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id ?? 'location'}-suggestions`}
      />

      {loading && (
        <span className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      )}

      {open && (
        <ul
          id={`${id ?? 'location'}-suggestions`}
          role="listbox"
          className={`absolute ${menuClassName} top-full z-40 mt-1 max-h-64 overflow-auto rounded-xl border border-gray-100 bg-white py-1 text-left shadow-lg`}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.key || `${suggestion.primary}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void selectSuggestion(suggestion)}
                className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition ${
                  index === activeIndex ? 'bg-brand-50' : 'hover:bg-gray-50'
                }`}
              >
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-gray-900">{suggestion.primary}</span>
                  {suggestion.secondary && (
                    <span className="block truncate text-xs text-gray-500">{suggestion.secondary}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LocationAutocomplete
