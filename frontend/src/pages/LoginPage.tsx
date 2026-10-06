import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconAlert } from '../components/icons'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="auth-card">
        <h1 className="auth-heading">Iniciar sesión</h1>
        <p className="auth-subtitle">Bienvenido de nuevo a Evently.</p>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <IconAlert className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            autoComplete="email"
            aria-label="Correo electrónico"
            placeholder="tu@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <PasswordInput
            autoComplete="current-password"
            aria-label="Contraseña"
            placeholder="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button className="auth-button" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-300">
          ¿No tienes cuenta?{' '}
          <Link className="auth-link" to="/register">
            Regístrate
          </Link>
        </p>
      </div>

      <div className="mx-auto mt-4 max-w-[400px] rounded-2xl border border-brand-300/30 bg-[rgba(28,10,46,0.6)] px-5 py-4 text-sm text-brand-200">
        <p className="font-semibold text-brand-100">Credenciales de prueba</p>
        <ul className="mt-2 space-y-1 text-brand-300">
          <li>Usuario: user@evently.com / user123</li>
          <li>Usuario 2: user2@evently.com / user123</li>
          <li>Admin: admin@evently.com / admin123</li>
        </ul>
      </div>
    </div>
  )
}

export default LoginPage
