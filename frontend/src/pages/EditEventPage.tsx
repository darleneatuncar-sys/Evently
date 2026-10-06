import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import EventForm, { type EventFormValues } from '../components/EventForm'
import Loader from '../components/Loader'
import { useAuth } from '../hooks/useAuth'
import { eventService } from '../services/eventService'
import type { Event, EventPayload } from '../types'
import { toDateInputValue } from '../utils/format'

function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEvent = useCallback(() => {
    if (!id) return
    setLoading(true)
    setError('')
    eventService
      .getById(id)
      .then(setEvent)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar el evento'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    loadEvent()
  }, [loadEvent])

  if (loading) {
    return <Loader label="Cargando evento..." fullHeight />
  }

  if (!id || error || !event) {
    return (
      <ErrorState
        message={error || 'No se pudo cargar el evento.'}
        onRetry={id ? loadEvent : undefined}
      />
    )
  }

  const isOwner = user && (event.creatorId === user.id || user.role === 'ADMIN')
  if (!isOwner) {
    return (
      <EmptyState
        title="Sin permisos"
        description="Solo el creador del evento o un administrador pueden editarlo."
        action={
          <Link to={`/events/${event.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
            Volver al evento
          </Link>
        }
      />
    )
  }

  const initialValues: EventFormValues = {
    title: event.title,
    description: event.description,
    date: toDateInputValue(event.date),
    time: event.time,
    location: event.location,
    placeId: event.placeId,
    latitude: event.latitude,
    longitude: event.longitude,
    categoryId: event.categoryId,
    capacity: String(event.capacity),
    price: event.price !== null ? String(event.price) : '',
    image: event.image ?? '',
  }

  const handleSubmit = async (payload: EventPayload) => {
    await eventService.update(id, payload)
    navigate(`/events/${id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-100">Editar evento</h1>
        <p className="mt-1 text-sm text-brand-300">Actualiza la información de tu evento.</p>
      </div>

      <div className="brutal-card p-6 sm:p-8">
        <EventForm initialValues={initialValues} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default EditEventPage
