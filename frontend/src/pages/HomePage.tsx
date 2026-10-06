import { useCallback, useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import CategoryChips from '../components/CategoryChips'
import CurvedInput from '../components/CurvedInput'
import DepthText from '../components/DepthText'
import DotField from '../components/DotField'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import EventCard from '../components/EventCard'
import Loader from '../components/Loader'
import { MagicGrid } from '../components/MagicBento'
import { categoryService } from '../services/categoryService'
import { eventService } from '../services/eventService'
import type { Category, Event } from '../types'

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const search = searchParams.get('search') ?? ''
  const locationQuery = searchParams.get('location') ?? ''
  const categoryId = searchParams.get('categoryId') ?? undefined
  const sort = searchParams.get('sort') ?? 'date_asc'

  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (location.hash === '#categorias') {
      document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  useEffect(() => {
    categoryService
      .list()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const loadEvents = useCallback(() => {
    setLoading(true)
    setError('')
    eventService
      .list({
        search: search || undefined,
        location: locationQuery || undefined,
        categoryId,
        sort,
      })
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar los eventos'))
      .finally(() => setLoading(false))
  }, [search, locationQuery, categoryId, sort])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  const handleSearchSubmit = (value: string) => {
    setParam('search', value.trim() || undefined)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const filtersLabel = [search ? `“${search}”` : '', locationQuery ? `en ${locationQuery}` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-12">
      <section className="relative left-1/2 isolate -mt-8 w-screen -translate-x-1/2 overflow-hidden border-b border-white/15 px-4 py-16 sm:py-24">
        <DotField
          className="pointer-events-none absolute inset-0 -z-10"
          dotRadius={1.4}
          dotSpacing={14}
          cursorRadius={480}
          bulgeStrength={70}
          glowRadius={190}
          gradientFrom="rgba(196, 181, 253, 0.55)"
          gradientTo="rgba(139, 92, 246, 0.22)"
          glowColor="rgba(139, 92, 246, 0.6)"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-brand-300/40 bg-brand-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
            Plataforma de eventos
          </span>

          <h1 className="mt-6">
            <DepthText
              text="Descubre tu próximo evento"
              fontSize="clamp(2.5rem, 9vw, 5.5rem)"
              fontWeight={900}
              faceColor="#ddd6fe"
              depthColor="#3b0764"
              layers={26}
              depth={1.8}
              tilt={6}
            />
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base text-brand-200 sm:text-lg">
            Descubre, crea y participa en eventos.
          </p>

          <div className="mx-auto mt-10 max-w-xl">
            <CurvedInput
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearchSubmit}
              placeholder="¿Qué evento estás buscando?"
              buttonText="Buscar"
              type="text"
              theme="light"
              backgroundColor="#ede9fe"
              textColor="#3b0764"
              placeholderColor="#7c6fb0"
              borderColor="#c4b5fd"
              buttonColor="#3b0764"
              buttonTextColor="#ede9fe"
              iconColor="#3b0764"
              shadowColor="#2e1065"
              width="100%"
              bend={26}
              height={64}
              cornerRadius={20}
              shadowSize="lg"
            />
          </div>
        </div>
      </section>

      <section id="categorias" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-bold text-brand-100 sm:text-2xl">Explora por categoría</h2>
        <CategoryChips
          categories={categories}
          selectedId={categoryId}
          onSelect={(id) => setParam('categoryId', id)}
        />
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-brand-100 sm:text-2xl">
            {search ? `Resultados para: ${search}` : 'Eventos destacados'}
          </h2>
          <select
            value={sort}
            onChange={(event) => setParam('sort', event.target.value === 'date_asc' ? undefined : event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 sm:w-auto"
          >
            <option value="date_asc">Próximos primero</option>
            <option value="date_desc">Más lejanos primero</option>
            <option value="recent">Publicados recientemente</option>
          </select>
        </div>

        {(search || locationQuery) && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-brand-200">
            <span>
              Mostrando resultados <strong className="text-brand-100">{filtersLabel}</strong>
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-brand-300 hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {loading ? (
          <Loader label="Cargando eventos..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadEvents} />
        ) : events.length === 0 ? (
          <EmptyState
            title={search ? `No encontramos eventos relacionados con “${search}”.` : 'No encontramos eventos'}
            description={
              search || locationQuery
                ? 'Intenta con otras palabras o ajusta la ubicación y la categoría.'
                : 'Intenta con otra búsqueda o cambia la categoría seleccionada.'
            }
          />
        ) : (
          <MagicGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </MagicGrid>
        )}
      </section>
    </div>
  )
}

export default HomePage
