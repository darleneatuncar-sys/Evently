import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { registrationService } from '../services/registrationService'
import type { Event, RegistrationResult } from '../types'
import { formatEventDate, formatEventTime } from '../utils/format'
import Modal from './Modal'
import { IconAlert, IconCalendar, IconCheck, IconMapPin } from './icons'

interface RegistrationModalProps {
  event: Event
  open: boolean
  onClose: () => void
  onRegistered: () => void
}

interface RegistrationForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string
}

type FormErrors = Partial<Record<keyof RegistrationForm, string>>

const EMPTY_FORM: RegistrationForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOADING_LABELS = ['Registrando...', 'Generando entrada...', 'Enviando correo...']

function splitName(name?: string): { firstName: string; lastName: string } {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  required?: boolean
  placeholder?: string
}

function Field({ id, label, value, onChange, error, type = 'text', required, placeholder }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-200 focus:border-brand-500 focus:ring-brand-200'
        }`}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

function RegistrationModal({ event, open, onClose, onRegistered }: RegistrationModalProps) {
  const { user } = useAuth()

  const [form, setForm] = useState<RegistrationForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState(LOADING_LABELS[0])
  const [result, setResult] = useState<RegistrationResult | null>(null)

  useEffect(() => {
    if (!open) return
    const { firstName, lastName } = splitName(user?.name)
    setForm({ ...EMPTY_FORM, firstName, lastName, email: user?.email ?? '' })
    setErrors({})
    setGeneralError('')
    setResult(null)
  }, [open, user])

  useEffect(() => {
    if (!submitting) return
    let index = 0
    setLoadingLabel(LOADING_LABELS[0])
    const interval = window.setInterval(() => {
      index = (index + 1) % LOADING_LABELS.length
      setLoadingLabel(LOADING_LABELS[index])
    }, 1200)
    return () => window.clearInterval(interval)
  }, [submitting])

  const setField = (field: keyof RegistrationForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!form.firstName.trim()) next.firstName = 'Ingresa tus nombres.'
    if (!form.lastName.trim()) next.lastName = 'Ingresa tus apellidos.'
    if (!EMAIL_REGEX.test(form.email.trim())) next.email = 'Ingresa un correo válido.'
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length < 6 || phoneDigits.length > 15) {
      next.phone = 'Ingresa un número de teléfono válido.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event_?: FormEvent) => {
    event_?.preventDefault()
    setGeneralError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const registration = await registrationService.register(event.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        organization: form.organization.trim() || undefined,
      })
      setResult(registration)
      onRegistered()
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'No pudimos completar tu registro.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Regístrate en este evento">
      {result ? (
        <div className="space-y-5 text-center">
          <div className="text-4xl">🎉</div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">¡Registro confirmado!</h3>
            <p className="text-sm text-gray-500">
              {result.emailSent
                ? 'Tu entrada fue enviada a tu correo electrónico.'
                : 'Tu registro fue confirmado, pero no pudimos enviar el correo. Puedes consultar tu entrada desde Mis entradas.'}
            </p>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
            <p className="text-xs font-medium text-brand-700">Código de entrada</p>
            <p className="mt-1 text-lg font-bold tracking-wider text-brand-800">{result.ticketCode}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              to="/tickets"
              onClick={onClose}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Ver mis entradas
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 rounded-2xl bg-slate-50 px-4 py-3">
            <p className="font-semibold text-gray-900">{event.title}</p>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <IconCalendar className="h-4 w-4 shrink-0 text-brand-500" />
              {formatEventDate(event.date)} · {formatEventTime(event.time)}
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <IconMapPin className="h-4 w-4 shrink-0 text-brand-500" />
              <span className="line-clamp-1">{event.location}</span>
            </p>
          </div>

          {generalError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <IconAlert className="h-5 w-5 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              id="firstName"
              label="Nombres completos"
              value={form.firstName}
              onChange={(value) => setField('firstName', value)}
              error={errors.firstName}
              required
              placeholder="Ej. María Fernanda"
            />
            <Field
              id="lastName"
              label="Apellidos completos"
              value={form.lastName}
              onChange={(value) => setField('lastName', value)}
              error={errors.lastName}
              required
              placeholder="Ej. Quispe Ramos"
            />
            <Field
              id="email"
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={(value) => setField('email', value)}
              error={errors.email}
              required
              placeholder="tucorreo@ejemplo.com"
            />
            <Field
              id="phone"
              label="Teléfono"
              type="tel"
              value={form.phone}
              onChange={(value) => setField('phone', value)}
              error={errors.phone}
              required
              placeholder="+51 999 999 999"
            />
            <div className="sm:col-span-2">
              <Field
                id="organization"
                label="Organización / Institución (opcional)"
                value={form.organization}
                onChange={(value) => setField('organization', value)}
                placeholder="Ej. Universidad Nacional de Cañete"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {submitting ? loadingLabel : 'Confirmar registro'}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
            <IconCheck className="h-4 w-4" />
            Recibirás tu entrada con código QR en el correo indicado.
          </p>
        </form>
      )}
    </Modal>
  )
}

export default RegistrationModal
