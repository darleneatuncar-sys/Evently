import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import Loader from '../components/Loader'
import {
  IconAlert,
  IconCalendar,
  IconEdit,
  IconSearch,
  IconTicket,
  IconTrash,
  IconUsers,
} from '../components/icons'
import { useAuth } from '../hooks/useAuth'
import { adminService } from '../services/adminService'
import { eventService } from '../services/eventService'
import { userService } from '../services/userService'
import type { AdminStats, AdminUser, Event } from '../types'
import { formatEventDate, formatRole } from '../utils/format'

function AdminPage() {
  const { user: currentUser } = useAuth()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [roleBusyId, setRoleBusyId] = useState('')
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [loadedStats, loadedUsers, loadedEvents] = await Promise.all([
        adminService.stats(),
        userService.list(),
        eventService.list(),
      ])
      setStats(loadedStats)
      setUsers(loadedUsers)
      setEvents(loadedEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la administración')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer.')) return
    setBusyId(eventId)
    setActionError('')
    try {
      await eventService.remove(eventId)
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo eliminar el evento')
    } finally {
      setBusyId('')
    }
  }

  const handleRoleChange = async (target: AdminUser) => {
    const nextRole = target.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const label = nextRole === 'ADMIN' ? 'administrador' : 'usuario'
    if (!window.confirm(`¿Convertir a ${target.name} en ${label}?`)) return
    setRoleBusyId(target.id)
    setActionError('')
    try {
      await userService.updateRole(target.id, nextRole)
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo cambiar el rol')
    } finally {
      setRoleBusyId('')
    }
  }

  if (loading) {
    return <Loader label="Cargando administración..." fullHeight />
  }

  if (error) {
    return <ErrorState message={error} onRetry={load} />
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredEvents = normalizedQuery
    ? events.filter((event) =>
        [event.title, event.location, event.category.name, event.creator.name]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : events

  const cards = [
    { label: 'Usuarios', value: stats?.users ?? 0, icon: IconUsers },
    { label: 'Eventos', value: stats?.events ?? 0, icon: IconCalendar },
    {
      label: 'Inscripciones',
      value: stats?.confirmedRegistrations ?? 0,
      icon: IconTicket,
      hint: `${stats?.registrations ?? 0} en total`,
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-brand-100">Panel de administración</h1>
        <p className="mt-1 text-sm text-brand-300">Gestiona usuarios y eventos de la plataforma.</p>
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <IconAlert className="h-5 w-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-extrabold text-gray-900">{card.value}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-700">{card.label}</p>
              {card.hint && <p className="text-xs text-gray-400">{card.hint}</p>}
            </div>
          )
        })}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-brand-100">Usuarios ({users.length})</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Eventos</th>
                <th className="px-4 py-3 font-semibold">Inscripciones</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.role === 'ADMIN' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-gray-600'
                        }`}
                      >
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user._count.events}</td>
                    <td className="px-4 py-3 text-gray-600">{user._count.registrations}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRoleChange(user)}
                        disabled={isSelf || roleBusyId === user.id}
                        title={isSelf ? 'No puedes cambiar tu propio rol' : undefined}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {roleBusyId === user.id
                          ? 'Cambiando...'
                          : user.role === 'ADMIN'
                            ? 'Hacer USER'
                            : 'Hacer ADMIN'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-brand-100">Eventos ({filteredEvents.length})</h2>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm sm:w-80">
            <IconSearch className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, creador, categoría o lugar"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-sm text-brand-300">No hay eventos que coincidan.</p>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{event.title}</p>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {event.category.name} · {formatEventDate(event.date)} · {event.location}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Creado por <span className="font-medium text-gray-600">{event.creator.name}</span> ·{' '}
                    <span className="font-medium text-gray-600">
                      {event.registeredCount}/{event.capacity}
                    </span>{' '}
                    inscritos
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/edit-event/${event.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <IconEdit className="h-4 w-4" />
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={busyId === event.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <IconTrash className="h-4 w-4" />
                    {busyId === event.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminPage
