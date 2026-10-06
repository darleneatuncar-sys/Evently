import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import EventImage from '../components/EventImage'
import FavoriteButton from '../components/FavoriteButton'
import Loader from '../components/Loader'
import RegistrationModal from '../components/RegistrationModal'
import {
  IconAlert,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconMapPin,
  IconSparkles,
  IconUsers,
} from '../components/icons'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../services/api'
import { aiService } from '../services/aiService'
import { eventService } from '../services/eventService'
import type { AIRecommendation, Event } from '../types'
import { getCategoryImage } from '../utils/categoryImages'
import { formatEventDate, formatEventTime, formatPrice, isEventFull } from '../utils/format'

function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justCreated = Boolean((location.state as { created?: boolean } | null)?.created)

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const loadEvent = useCallback(() => {
    if (!id) return
    setLoading(true)
    setError('')
    setNotFound(false)
    eventService
      .getById(id)
      .then(setEvent)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(err instanceof Error ? err.message : 'Error al cargar el evento')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    loadEvent()
  }, [loadEvent])

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer.')) {
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await eventService.remove(id)
      navigate('/my-events')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar el evento')
      setDeleting(false)
    }
  }

  const handleRecommendation = async () => {
    if (!event) return
    setAiLoading(true)
    setAiError('')
    setRecommendation(null)
    try {
      const result = await aiService.recommend({
        title: event.title,
        description: event.description,
        category: event.category.name,
        location: event.location,
      })
      setRecommendation(result)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'No se pudo obtener la recomendación')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return <Loader label="Cargando evento..." fullHeight />
  }

  if (notFound) {
    return (
      <EmptyState
        title="Evento no encontrado"
        description="El evento que buscas no existe o fue eliminado."
        action={
          <Link to="/" className="text-sm font-semibold text-brand-700 hover:underline">
            Volver al inicio
          </Link>
        }
      />
    )
  }

  if (error || !event) {
    return <ErrorState message={error || 'No se pudo cargar el evento.'} onRetry={loadEvent} />
  }

  const full = isEventFull(event.capacity, event.registeredCount)

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand-300 hover:text-brand-200 hover:underline">
        ← Volver a eventos
      </Link>

      {justCreated && (
        <div className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <IconCheck className="h-5 w-5 shrink-0" />
          <span>🎉 ¡Evento publicado correctamente! Ya aparece en Explorar.</span>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <EventImage
          src={event.image}
          alt={event.title}
          fallbackSrc={getCategoryImage(event.category.name)}
          className="h-56 w-full sm:h-80"
        />

        <div className="space-y-6 p-6 sm:p-8">
          <div className="space-y-3">
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {event.category.name}
            </span>
            <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-4xl">{event.title}</h1>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <IconCalendar className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-xs font-medium text-gray-500">Fecha</p>
                <p className="text-sm font-semibold text-gray-900">{formatEventDate(event.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <IconCalendar className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-xs font-medium text-gray-500">Hora</p>
                <p className="text-sm font-semibold text-gray-900">{formatEventTime(event.time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <IconMapPin className="h-5 w-5 text-brand-600" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Ubicación</p>
                <p className="truncate text-sm font-semibold text-gray-900">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900">Descripción</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {event.description}
                </p>
              </section>

              <section className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">¿Qué debería llevar?</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Obtén una recomendación según el tipo de evento.
                    </p>
                  </div>
                  <IconSparkles className="h-6 w-6 shrink-0 text-brand-600" />
                </div>

                <button
                  type="button"
                  onClick={handleRecommendation}
                  disabled={aiLoading}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconSparkles className="h-4 w-4" />
                  {aiLoading ? 'Generando recomendación...' : '¿Qué debería llevar?'}
                </button>

                {aiError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <IconAlert className="h-5 w-5 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                {recommendation && (
                  <div className="mt-4 rounded-xl border border-brand-100 bg-white px-4 py-3">
                    <p className="text-sm leading-relaxed text-gray-700">{recommendation.recommendation}</p>
                    {recommendation.source === 'fallback' && (
                      <p className="mt-2 text-xs text-gray-400">
                        Recomendación generada localmente. Configura AI_API_KEY para usar el modelo de IA.
                      </p>
                    )}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-5 lg:col-span-1">
              <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconUsers className="h-5 w-5 text-brand-600" />
                  <span>
                    <strong className="text-gray-900">{event.registeredCount}</strong> de {event.capacity}{' '}
                    inscritos
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{
                      width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Creado por</p>
                    <p className="truncate font-semibold text-gray-900">{event.creator.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500">Precio</p>
                    <p className="font-semibold text-gray-900">{formatPrice(event.price)}</p>
                  </div>
                </div>

                {(user?.id === event.creatorId || user?.role === 'ADMIN') && (
                  <div className="space-y-2">
                    <Link
                      to={`/edit-event/${event.id}`}
                      className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Editar evento
                    </Link>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full rounded-xl border border-red-100 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleting ? 'Eliminando...' : 'Eliminar evento'}
                    </button>
                    {deleteError && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                        <IconAlert className="h-5 w-5 shrink-0" />
                        <span>{deleteError}</span>
                      </div>
                    )}
                  </div>
                )}

                {!user ? (
                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Inicia sesión para registrarte
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                ) : event.isRegistered ? (
                  <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                    <IconCheck className="h-4 w-4" />
                    Ya estás registrado
                  </div>
                ) : full ? (
                  <div className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500">
                    Evento lleno
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRegistrationOpen(true)}
                    className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Registrarme
                  </button>
                )}

                <FavoriteButton eventId={event.id} variant="full" />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <RegistrationModal
        event={event}
        open={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
        onRegistered={loadEvent}
      />
    </div>
  )
}

export default EventDetailPage
