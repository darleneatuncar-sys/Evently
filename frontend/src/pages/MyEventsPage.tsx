import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import EventImage from '../components/EventImage'
import Loader from '../components/Loader'
import { IconAlert, IconEdit, IconPlus, IconTrash, IconUsers } from '../components/icons'
import { eventService } from '../services/eventService'
import type { Attendee, Event } from '../types'
import { formatEventDate, formatPrice } from '../utils/format'

function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState('')

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [attendeesError, setAttendeesError] = useState('')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setEvents(await eventService.mine())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus eventos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer.')) return
    setBusyId(eventId)
    setActionError('')
    try {
      await eventService.remove(eventId)
      await loadEvents()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo eliminar el evento')
    } finally {
      setBusyId('')
    }
  }

  const toggleAttendees = async (eventId: string) => {
    if (expandedId === eventId) {
      setExpandedId(null)
      return
    }
    setExpandedId(eventId)
    setAttendees([])
    setAttendeesError('')
    setAttendeesLoading(true)
    try {
      setAttendees(await eventService.attendees(eventId))
    } catch (err) {
      setAttendeesError(err instanceof Error ? err.message : 'No se pudieron cargar los asistentes')
    } finally {
      setAttendeesLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-100">Mis eventos</h1>
          <p className="mt-1 text-sm text-brand-300">Eventos que has creado.</p>
        </div>
        <Link
          to="/create-event"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <IconPlus className="h-4 w-4" />
          Crear evento
        </Link>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <IconAlert className="h-5 w-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <Loader label="Cargando tus eventos..." fullHeight />
      ) : error ? (
        <ErrorState message={error} onRetry={loadEvents} />
      ) : events.length === 0 ? (
        <EmptyState
          title="Todavía no has creado eventos"
          description="Publica tu primer evento y aparecerá en Explorar."
          action={
            <Link
              to="/create-event"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Crear evento
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <article key={event.id} className="brutal-card overflow-hidden">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <EventImage src={event.image} alt={event.title} className="h-24 w-full rounded-xl sm:w-32" />
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-base font-semibold text-brand-50">{event.title}</h3>
                  <p className="text-sm text-brand-200">
                    {formatEventDate(event.date)} · {event.location}
                  </p>
                  <p className="text-sm text-brand-300">
                    {event.registeredCount} / {event.capacity} inscritos · {formatPrice(event.price)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="rounded-xl border border-brand-300/30 px-3.5 py-2 text-sm font-medium text-brand-200 transition hover:bg-brand-300/10"
                  >
                    Ver evento
                  </Link>
                  <Link
                    to={`/edit-event/${event.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300/30 px-3.5 py-2 text-sm font-medium text-brand-200 transition hover:bg-brand-300/10"
                  >
                    <IconEdit className="h-4 w-4" />
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleAttendees(event.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300/30 px-3.5 py-2 text-sm font-medium text-brand-200 transition hover:bg-brand-300/10"
                  >
                    <IconUsers className="h-4 w-4" />
                    Asistentes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    disabled={busyId === event.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/30 px-3.5 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    <IconTrash className="h-4 w-4" />
                    {busyId === event.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>

              {expandedId === event.id && (
                <div className="border-t border-white/10 bg-white/5 px-5 py-4">
                  <h4 className="text-sm font-semibold text-brand-100">Asistentes registrados</h4>
                  {attendeesLoading ? (
                    <p className="mt-2 text-sm text-brand-300">Cargando asistentes...</p>
                  ) : attendeesError ? (
                    <p className="mt-2 text-sm text-red-300">{attendeesError}</p>
                  ) : attendees.length === 0 ? (
                    <p className="mt-2 text-sm text-brand-300">Todavía no hay asistentes registrados.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-white/10">
                      {attendees.map((attendee) => (
                        <li key={attendee.id} className="flex items-center justify-between py-2 text-sm">
                          <span className="font-medium text-brand-100">{attendee.user.name}</span>
                          <span className="text-brand-300">{attendee.user.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyEventsPage
