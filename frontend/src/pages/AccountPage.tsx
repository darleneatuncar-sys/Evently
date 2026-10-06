import { Link, useNavigate } from 'react-router-dom'
import { IconGrid, IconHeart, IconLogout, IconTicket, IconUser } from '../components/icons'
import { useAuth } from '../hooks/useAuth'
import { formatRole } from '../utils/format'

function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return null
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
            {initials}
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {formatRole(user.role)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <IconLogout className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            to="/tickets"
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-slate-50 px-5 py-4 transition hover:border-brand-200 hover:bg-brand-50/50"
          >
            <IconTicket className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Mis entradas</p>
              <p className="text-xs text-gray-500">Eventos a los que asistirás</p>
            </div>
          </Link>
          <Link
            to="/my-events"
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-slate-50 px-5 py-4 transition hover:border-brand-200 hover:bg-brand-50/50"
          >
            <IconGrid className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Mis eventos</p>
              <p className="text-xs text-gray-500">Eventos que creaste</p>
            </div>
          </Link>
          <Link
            to="/favorites"
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-slate-50 px-5 py-4 transition hover:border-brand-200 hover:bg-brand-50/50"
          >
            <IconHeart className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Me gusta</p>
              <p className="text-xs text-gray-500">Eventos que guardaste</p>
            </div>
          </Link>
        </div>

        {user.role === 'ADMIN' && (
          <div className="mt-3">
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 px-5 py-4 transition hover:border-brand-300 hover:bg-brand-50"
            >
              <IconUser className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Administración</p>
                <p className="text-xs text-gray-500">Gestiona usuarios y eventos de la plataforma</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountPage
