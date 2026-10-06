import Modal from './Modal'
import { IconCalendar, IconMapPin, IconTicket, IconUser } from './icons'
import type { UserEvent } from '../types'
import { formatEventDate, formatEventTime } from '../utils/format'

interface TicketModalProps {
  ticket: UserEvent | null
  onClose: () => void
}

function TicketModal({ ticket, onClose }: TicketModalProps) {
  return (
    <Modal open={Boolean(ticket)} onClose={onClose} title="Mi entrada">
      {ticket && (
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <IconTicket className="h-3.5 w-3.5" />
              Entrada confirmada
            </span>
            <h3 className="text-lg font-bold text-gray-900">{ticket.title}</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <IconCalendar className="h-5 w-5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Fecha</p>
                <p className="truncate text-sm font-semibold text-gray-900">
                  {formatEventDate(ticket.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <IconCalendar className="h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-xs font-medium text-gray-500">Hora</p>
                <p className="text-sm font-semibold text-gray-900">{formatEventTime(ticket.time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <IconMapPin className="h-5 w-5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Ubicación</p>
                <p className="truncate text-sm font-semibold text-gray-900">{ticket.location}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <IconUser className="h-5 w-5 shrink-0 text-brand-600" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500">Asistente</p>
              <p className="truncate text-sm font-semibold text-gray-900">
                {ticket.attendee.firstName} {ticket.attendee.lastName}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-5 text-center">
            <p className="text-xs font-medium text-brand-700">Código de entrada</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wider text-brand-800">
              {ticket.ticketCode}
            </p>
            {ticket.qrCode && (
              <img
                src={ticket.qrCode}
                alt={`Código QR de la entrada ${ticket.ticketCode}`}
                className="mx-auto mt-4 h-48 w-48 rounded-xl border border-brand-100 bg-white p-2"
              />
            )}
            <p className="mt-3 text-xs text-brand-700">Muestra este código QR al ingresar al evento.</p>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default TicketModal
