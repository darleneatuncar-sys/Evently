import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFavorites } from '../hooks/useFavorites'
import { IconHeart } from './icons'

interface FavoriteButtonProps {
  eventId: string
  variant?: 'icon' | 'full'
}

function FavoriteButton({ eventId, variant = 'icon' }: FavoriteButtonProps) {
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const active = isFavorite(eventId)

  const handleClick = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      navigate('/login')
      return
    }

    setBusy(true)
    try {
      await toggleFavorite(eventId)
    } catch {
      // Si falla, se mantiene el estado previo.
    } finally {
      setBusy(false)
    }
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
          active
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:text-red-600'
        }`}
      >
        <IconHeart className="h-5 w-5" filled={active} />
        {active ? 'Guardado en Me gusta' : 'Me gusta'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={active ? 'Quitar de Me gusta' : 'Guardar en Me gusta'}
      className={`grid h-9 w-9 place-items-center rounded-full border shadow-sm transition disabled:opacity-60 ${
        active
          ? 'border-red-100 bg-white text-red-500'
          : 'border-gray-100 bg-white/90 text-gray-500 hover:text-red-500'
      }`}
    >
      <IconHeart className="h-5 w-5" filled={active} />
    </button>
  )
}

export default FavoriteButton
