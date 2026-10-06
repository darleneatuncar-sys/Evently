import type { Event } from '../types'
import { formatEventDate } from '../utils/format'
import { IconSearch } from './icons'

interface EventSearchSuggestionsProps {
  open: boolean
  loading: boolean
  query: string
  mode?: 'text' | 'location'
  events: Event[]
  onSelect: (event: Event) => void
}

function EventSearchSuggestions({
  open,
  loading,
  query,
  mode = 'text',
  events,
  onSelect,
}: EventSearchSuggestionsProps) {
  if (!open) return null

  const emptyMessage =
    mode === 'location'
      ? `No existe ningún evento en “${query}”.`
      : `No encontramos eventos relacionados con “${query}”.`

  return (
    <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
      {loading ? (
        <p className="px-4 py-3 text-sm text-gray-400">Buscando eventos...</p>
      ) : events.length === 0 ? (
        <p className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <>
          <p className="border-b border-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {mode === 'location' ? `Eventos en “${query}”` : `Resultados para “${query}”`}
          </p>
          <ul className="max-h-80 overflow-auto py-1">
            {events.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onMouseDown={(mouseEvent) => mouseEvent.preventDefault()}
                  onClick={() => onSelect(event)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-gray-50"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <IconSearch className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-900">{event.title}</span>
                    <span className="block truncate text-xs text-gray-500">
                      {event.category.name} · {formatEventDate(event.date)} · {event.location}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default EventSearchSuggestions
