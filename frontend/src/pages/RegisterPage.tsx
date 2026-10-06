import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconAlert } from '../components/icons'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../hooks/useAuth'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setSubmitting(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1 className="auth-heading">Crear cuenta</h1>
      <p className="auth-subtitle">Únete a Evently y comienza a descubrir eventos.</p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <IconAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          className="auth-input"
          aria-label="Nombre"
          placeholder="Tu nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          autoComplete="new-password"
          aria-label="Contraseña"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          autoComplete="new-password"
          aria-label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>

      <p className="text-center text-sm text-brand-300">
        ¿Ya tienes cuenta?{' '}
        <Link className="auth-link" to="/login">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}

export default RegisterPage
