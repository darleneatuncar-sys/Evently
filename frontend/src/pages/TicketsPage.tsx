import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import EventImage from '../components/EventImage'
import Loader from '../components/Loader'
import TicketModal from '../components/TicketModal'
import { IconAlert, IconCalendar, IconMapPin, IconTicket } from '../components/icons'
import { registrationService } from '../services/registrationService'
import type { UserEvent } from '../types'
import { formatDateTime, formatEventDate, formatEventTime } from '../utils/format'

function TicketsPage() {
  const [tickets, setTickets] = useState<UserEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<UserEvent | null>(null)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setTickets(await registrationService.myTickets())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cargar tus entradas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  const handleCancel = async (eventId: string) => {
    if (!window.confirm('¿Seguro que deseas cancelar tu entrada a este evento?')) return
    setBusyId(eventId)
    setActionError('')
    try {
      await registrationService.cancel(eventId)
      await loadTickets()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo cancelar la entrada')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-100">Mis entradas</h1>
        <p className="mt-1 text-sm text-brand-300">Los eventos a los que te has registrado.</p>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <IconAlert className="h-5 w-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <Loader label="Cargando tus entradas..." fullHeight />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTickets} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="Todavía no tienes entradas"
          description="Explora los eventos y regístrate para verlos aquí."
          action={
            <Link
              to="/"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Explorar eventos
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <article
              key={ticket.registrationId}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:flex-row"
            >
              <EventImage
                src={ticket.image}
                alt={ticket.title}
                className="h-40 w-full sm:h-auto sm:w-44"
              />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    <IconTicket className="h-3.5 w-3.5" />
                    Entrada confirmada
                  </span>
                </div>

                <h3 className="line-clamp-2 text-base font-semibold text-gray-900">{ticket.title}</h3>

                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 shrink-0 text-brand-500" />
                    {formatEventDate(ticket.date)} · {formatEventTime(ticket.time)}
                  </p>
                  <p className="flex items-center gap-2">
                    <IconMapPin className="h-4 w-4 shrink-0 text-brand-500" />
                    <span className="line-clamp-1">{ticket.location}</span>
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  Código:{' '}
                  <span className="font-mono font-semibold text-gray-700">{ticket.ticketCode}</span>
                </p>
                <p className="text-xs text-gray-400">
                  Registrada el {formatDateTime(ticket.registeredAt)}
                </p>

                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticket)}
                    className="rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Ver entrada
                  </button>
                  <Link
                    to={`/events/${ticket.id}`}
                    className="rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Ver evento
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCancel(ticket.id)}
                    disabled={busyId === ticket.id}
                    className="rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    {busyId === ticket.id ? 'Cancelando...' : 'Cancelar entrada'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  )
}

export default TicketsPage
