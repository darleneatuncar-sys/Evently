import { useNavigate } from 'react-router-dom'
import EventForm from '../components/EventForm'
import { eventService } from '../services/eventService'
import type { EventPayload } from '../types'

function CreateEventPage() {
  const navigate = useNavigate()

  const handleSubmit = async (payload: EventPayload) => {
    const event = await eventService.create(payload)
    navigate(`/events/${event.id}`, { state: { created: true } })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-100">Crear evento</h1>
        <p className="mt-1 text-sm text-brand-300">
          Publica un nuevo evento para que los asistentes puedan registrarse.
        </p>
      </div>

      <div className="brutal-card p-6 sm:p-8">
        <EventForm submitLabel="Publicar evento" onSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default CreateEventPage
