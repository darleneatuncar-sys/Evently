import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { eventService } from '../services/eventService'
import type { Event } from '../types'
import EventSearchSuggestions from './EventSearchSuggestions'
import GooeyNav, { type GooeyNavItem } from './GooeyNav'
import LocationAutocomplete from './LocationAutocomplete'
import Logo from './Logo'
import {
  IconChevronDown,
  IconClose,
  IconGrid,
  IconHeart,
  IconLogout,
  IconMapPin,
  IconMenu,
  IconPlus,
  IconSearch,
  IconTicket,
  IconUser,
} from './icons'

const mobileItemClass = (isActive: boolean) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
  }`

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const [searchParams] = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '')
  const [locationTerm, setLocationTerm] = useState(searchParams.get('location') ?? '')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Event[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const desktopFormRef = useRef<HTMLDivElement>(null)
  const mobileFormRef = useRef<HTMLDivElement>(null)
  const suggestionsDebounceRef = useRef<number | null>(null)
  const suggestionsRequestRef = useRef(0)

  const canCreate = Boolean(user)
  const isAdmin = user?.role === 'ADMIN'
  const initials = user
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
    : ''

  const navItems = useMemo<GooeyNavItem[]>(
    () => [
      ...(user
        ? [{ label: 'Me gusta', to: '/favorites', icon: <IconHeart className="h-5 w-5" /> }]
        : []),
      ...(user
        ? [{ label: 'Mis entradas', to: '/tickets', icon: <IconTicket className="h-5 w-5" /> }]
        : []),
      ...(user
        ? [{ label: 'Mis eventos', to: '/my-events', icon: <IconGrid className="h-5 w-5" /> }]
        : []),
      ...(canCreate
        ? [{ label: 'Crear evento', to: '/create-event', icon: <IconPlus className="h-5 w-5" /> }]
        : []),
      ...(isAdmin
        ? [{ label: 'Administración', to: '/admin', icon: <IconUser className="h-5 w-5" /> }]
        : []),
    ],
    [user, canCreate, isAdmin],
  )

  useEffect(() => {
    setSearchTerm(searchParams.get('search') ?? '')
    setLocationTerm(searchParams.get('location') ?? '')
  }, [searchParams])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setSuggestionsOpen(false)
  }, [routerLocation.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node
      const inside =
        desktopFormRef.current?.contains(target) || mobileFormRef.current?.contains(target)
      if (!inside) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const runSuggestions = useCallback(async (term: string, loc: string) => {
    const hasTerm = term.trim().length >= 2
    const hasLoc = loc.trim().length >= 2
    if (!hasTerm && !hasLoc) {
      setSuggestions([])
      return
    }
    const requestId = ++suggestionsRequestRef.current
    setSuggestionsLoading(true)
    try {
      const results = await eventService.list({
        search: hasTerm ? term.trim() : undefined,
        location: hasLoc ? loc.trim() : undefined,
        limit: 6,
      })
      if (requestId !== suggestionsRequestRef.current) return
      setSuggestions(results)
    } catch {
      if (requestId === suggestionsRequestRef.current) setSuggestions([])
    } finally {
      if (requestId === suggestionsRequestRef.current) setSuggestionsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (suggestionsDebounceRef.current) window.clearTimeout(suggestionsDebounceRef.current)
    const hasTerm = searchTerm.trim().length >= 2
    const hasLocation = locationTerm.trim().length >= 2
    if (!hasTerm && !hasLocation) {
      setSuggestions([])
      setSuggestionsLoading(false)
      return
    }
    if (!suggestionsOpen) return
    suggestionsDebounceRef.current = window.setTimeout(() => {
      void runSuggestions(searchTerm, locationTerm)
    }, 250)
    return () => {
      if (suggestionsDebounceRef.current) window.clearTimeout(suggestionsDebounceRef.current)
    }
  }, [searchTerm, locationTerm, suggestionsOpen, runSuggestions])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setMobileOpen(false)
    setSuggestionsOpen(false)
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.set('search', searchTerm.trim())
    if (locationTerm.trim()) params.set('location', locationTerm.trim())
    const query = params.toString()
    navigate(query ? `/?${query}` : '/')
  }

  const handleSelectSuggestion = (event: Event) => {
    setSuggestionsOpen(false)
    setMobileOpen(false)
    navigate(`/events/${event.id}`)
  }

  const trimmedSearch = searchTerm.trim()
  const trimmedLocation = locationTerm.trim()
  const suggestionsVisible =
    suggestionsOpen && (trimmedSearch.length >= 2 || trimmedLocation.length >= 2)
  const suggestionsQuery = trimmedSearch || trimmedLocation
  const suggestionsMode: 'text' | 'location' = trimmedSearch ? 'text' : 'location'

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-[#210835] text-brand-200 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-black/40' : ''
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight">
          <Logo className="h-8 w-8" />
          <span className="hidden sm:inline">Evently</span>
        </Link>

        <div ref={desktopFormRef} className="relative hidden flex-1 lg:block lg:max-w-xs xl:max-w-sm">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-full border border-brand-300/50 bg-brand-100 px-2 py-1 shadow-sm transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-300/40"
          >
            <span className="pl-2 text-brand-400">
              <IconSearch className="h-5 w-5" />
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder="Buscar eventos"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-brand-950 outline-none placeholder:text-brand-400"
            />
            <span className="mx-1 hidden h-6 w-px bg-brand-300/60 xl:block" />
            <span className="hidden pl-1 text-brand-400 xl:block">
              <IconMapPin className="h-5 w-5" />
            </span>
            <LocationAutocomplete
              value={locationTerm}
              onChange={setLocationTerm}
              onFocus={() => setSuggestionsOpen(false)}
              onSelect={() => setSuggestionsOpen(true)}
              placeholder="Ubicación"
              wrapperClassName="hidden xl:block xl:w-40"
              menuClassName="left-auto right-0 min-w-[18rem] max-w-[22rem]"
              className="w-full bg-transparent px-2 py-2 text-sm text-brand-950 outline-none placeholder:text-brand-400"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-950 text-brand-100 transition hover:bg-brand-900"
            >
              <IconSearch className="h-4 w-4" />
            </button>
          </form>

          <EventSearchSuggestions
            open={suggestionsVisible}
            loading={suggestionsLoading}
            query={suggestionsQuery}
            mode={suggestionsMode}
            events={suggestions}
            onSelect={handleSelectSuggestion}
          />
        </div>

        <div className="flex-1 lg:hidden" />

        <div className="hidden lg:block">
          <GooeyNav items={navItems} />
        </div>

        <div className="hidden lg:block">
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 transition hover:bg-brand-300/10"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-300/20 text-xs font-bold text-brand-200">
                  {initials}
                </span>
                <span className="max-w-[120px] truncate text-sm font-medium text-brand-200">{user.name}</span>
                <IconChevronDown className="h-4 w-4 text-brand-200/70" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  <Link to="/account" className="block px-4 py-2.5 hover:bg-gray-50">
                    <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  </Link>
                  <div className="border-t border-gray-100" />
                  <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Mi cuenta
                  </Link>
                  <Link to="/tickets" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Mis entradas
                  </Link>
                  <Link to="/my-events" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Mis eventos
                  </Link>
                  <Link to="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Me gusta
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Administración
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <IconLogout className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-brand-300/40 px-3 py-2 text-sm font-medium text-brand-200 transition hover:bg-brand-300/10"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-950 px-4 py-2 text-sm font-semibold text-brand-100 transition hover:bg-brand-900"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-lg p-2 text-brand-200 transition hover:bg-brand-300/10 lg:hidden"
          aria-label="Abrir menú de navegación"
        >
          {mobileOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          <div ref={mobileFormRef} className="relative">
            <form onSubmit={handleSearch} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-brand-300/50 bg-brand-100 px-3 py-2">
                <IconSearch className="h-5 w-5 text-brand-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onFocus={() => setSuggestionsOpen(true)}
                  placeholder="Buscar eventos"
                  autoComplete="off"
                  className="w-full bg-transparent py-1 text-sm text-brand-950 outline-none placeholder:text-brand-400"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-brand-300/50 bg-brand-100 px-3 py-2">
                <IconMapPin className="h-5 w-5 shrink-0 text-brand-400" />
                <LocationAutocomplete
                  value={locationTerm}
                  onChange={setLocationTerm}
                  onFocus={() => setSuggestionsOpen(false)}
                  onSelect={() => setSuggestionsOpen(true)}
                  placeholder="Ubicación"
                  wrapperClassName="flex-1"
                  className="w-full bg-transparent py-1 text-sm text-brand-950 outline-none placeholder:text-brand-400"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-brand-950 px-4 py-2.5 text-sm font-semibold text-brand-100 transition hover:bg-brand-900"
              >
                Buscar
              </button>
            </form>

            <EventSearchSuggestions
              open={suggestionsVisible}
              loading={suggestionsLoading}
              query={suggestionsQuery}
              mode={suggestionsMode}
              events={suggestions}
              onSelect={handleSelectSuggestion}
            />
          </div>

          <div className="mt-4 flex flex-col gap-1">
            {user && (
              <NavLink
                to="/favorites"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => mobileItemClass(isActive)}
              >
                <IconHeart className="h-5 w-5" />
                Me gusta
              </NavLink>
            )}
            {user && (
              <NavLink
                to="/tickets"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => mobileItemClass(isActive)}
              >
                <IconTicket className="h-5 w-5" />
                Mis entradas
              </NavLink>
            )}
            {user && (
              <NavLink
                to="/my-events"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => mobileItemClass(isActive)}
              >
                <IconGrid className="h-5 w-5" />
                Mis eventos
              </NavLink>
            )}
            {canCreate && (
              <NavLink
                to="/create-event"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => mobileItemClass(isActive)}
              >
                <IconPlus className="h-5 w-5" />
                Crear evento
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => mobileItemClass(isActive)}
              >
                <IconUser className="h-5 w-5" />
                Administración
              </NavLink>
            )}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-800">{user.name}</span>
                    <span className="block truncate text-xs text-gray-500">Mi cuenta</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
                >
                  <IconLogout className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
