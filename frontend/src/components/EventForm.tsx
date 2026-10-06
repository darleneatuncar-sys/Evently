import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { categoryService } from '../services/categoryService'
import type { Category, EventPayload } from '../types'
import { fileToCompressedDataUrl } from '../utils/image'
import EventImage from './EventImage'
import LocationAutocomplete from './LocationAutocomplete'
import { IconAlert } from './icons'

export interface EventFormValues {
  title: string
  description: string
  date: string
  time: string
  location: string
  placeId: string | null
  latitude: number | null
  longitude: number | null
  categoryId: string
  capacity: string
  price: string
  image: string
}

const EMPTY_VALUES: EventFormValues = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  placeId: null,
  latitude: null,
  longitude: null,
  categoryId: '',
  capacity: '',
  price: '',
  image: '',
}

interface EventFormProps {
  initialValues?: Partial<EventFormValues>
  submitLabel: string
  onSubmit: (payload: EventPayload) => Promise<void>
}

const inputClass =
  'w-full rounded-xl border border-brand-300/30 bg-[#180722] px-3.5 py-2.5 text-sm text-brand-50 outline-none transition placeholder:text-brand-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30'
const labelClass = 'mb-1.5 block text-sm font-medium text-brand-200'

function EventForm({ initialValues, submitLabel, onSubmit }: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>({ ...EMPTY_VALUES, ...initialValues })
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    categoryService
      .list()
      .then(setCategories)
      .catch(() => setError('No se pudieron cargar las categorías'))
      .finally(() => setLoadingCategories(false))
  }, [])

  const update = (field: keyof EventFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen es demasiado grande (máximo 10 MB)')
      return
    }
    setUploadingImage(true)
    setError('')
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      update('image', dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!values.title.trim()) {
      setError('El título es obligatorio')
      return
    }
    if (!values.description.trim()) {
      setError('La descripción es obligatoria')
      return
    }
    if (!values.date) {
      setError('La fecha es obligatoria')
      return
    }
    if (!values.time) {
      setError('La hora es obligatoria')
      return
    }
    if (!values.location.trim()) {
      setError('La ubicación es obligatoria')
      return
    }
    if (!values.categoryId) {
      setError('Selecciona una categoría')
      return
    }

    const capacity = Number(values.capacity)
    if (!Number.isInteger(capacity) || capacity <= 0) {
      setError('La capacidad debe ser un número entero mayor a 0')
      return
    }

    const price = values.price.trim() === '' ? null : Number(values.price)
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setError('El precio debe ser un número mayor o igual a 0')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        date: values.date,
        time: values.time,
        location: values.location.trim(),
        placeId: values.placeId,
        latitude: values.latitude,
        longitude: values.longitude,
        categoryId: values.categoryId,
        capacity,
        price,
        image: values.image.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el evento')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <IconAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="title">
            Título
          </label>
          <input
            id="title"
            className={inputClass}
            value={values.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="Ej. Conferencia de Inteligencia Artificial"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            className={`${inputClass} min-h-[120px] resize-y`}
            value={values.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Describe de qué trata el evento, qué incluye y a quién va dirigido."
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="date">
            Fecha
          </label>
          <input
            id="date"
            type="date"
            className={inputClass}
            value={values.date}
            onChange={(event) => update('date', event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="time">
            Hora
          </label>
          <input
            id="time"
            type="time"
            className={inputClass}
            value={values.time}
            onChange={(event) => update('time', event.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="location">
            Ubicación
          </label>
          <LocationAutocomplete
            id="location"
            value={values.location}
            onChange={(value) =>
              setValues((current) => ({
                ...current,
                location: value,
                placeId: null,
                latitude: null,
                longitude: null,
              }))
            }
            onSelect={(selection) =>
              setValues((current) => ({
                ...current,
                location: selection.location,
                placeId: selection.placeId,
                latitude: selection.latitude,
                longitude: selection.longitude,
              }))
            }
            placeholder="Buscar una ubicación"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="category">
            Categoría
          </label>
          <select
            id="category"
            className={inputClass}
            value={values.categoryId}
            onChange={(event) => update('categoryId', event.target.value)}
            disabled={loadingCategories}
          >
            <option value="">{loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="capacity">
            Capacidad máxima
          </label>
          <input
            id="capacity"
            type="number"
            min={1}
            className={inputClass}
            value={values.capacity}
            onChange={(event) => update('capacity', event.target.value)}
            placeholder="Ej. 100"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="price">
            Precio (opcional)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={values.price}
            onChange={(event) => update('price', event.target.value)}
            placeholder="Déjalo vacío o 0 para evento gratuito"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="image">
            Imagen del evento (opcional)
          </label>
          <input
            id="image"
            className={inputClass}
            value={values.image.startsWith('data:') ? '' : values.image}
            onChange={(event) => update('image', event.target.value)}
            placeholder="Pega una URL (https://...) o sube un archivo"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-300/30 px-3.5 py-2 text-sm font-medium text-brand-200 transition hover:bg-brand-300/10">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploadingImage}
              />
              {uploadingImage ? 'Procesando imagen...' : 'Subir imagen'}
            </label>
            {values.image.trim() && (
              <button
                type="button"
                onClick={() => update('image', '')}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Quitar imagen
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-brand-300/70">
            Sin almacenamiento en la nube (MVP): la imagen se guarda como dato en la base de datos. Al
            subir un archivo se comprime automáticamente.
          </p>
          {values.image.trim() && (
            <div className="mt-3 flex justify-center overflow-hidden rounded-xl border border-brand-300/30 bg-black/20 p-2">
              <EventImage
                src={values.image.trim()}
                alt="Vista previa del evento"
                fit="contain"
                className="max-h-80 w-auto max-w-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default EventForm
