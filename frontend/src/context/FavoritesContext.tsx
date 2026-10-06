import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { favoriteService } from '../services/favoriteService'
import type { Event } from '../types'

export interface FavoritesContextValue {
  favorites: Event[]
  loading: boolean
  isFavorite: (eventId: string) => boolean
  toggleFavorite: (eventId: string) => Promise<void>
  refresh: () => Promise<void>
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setFavorites([])
      return
    }
    setLoading(true)
    try {
      setFavorites(await favoriteService.list())
    } catch {
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isFavorite = useCallback(
    (eventId: string) => favorites.some((event) => event.id === eventId),
    [favorites],
  )

  const toggleFavorite = useCallback(
    async (eventId: string) => {
      if (favorites.some((event) => event.id === eventId)) {
        await favoriteService.remove(eventId)
      } else {
        await favoriteService.add(eventId)
      }
      await refresh()
    },
    [favorites, refresh],
  )

  const value = useMemo(
    () => ({ favorites, loading, isFavorite, toggleFavorite, refresh }),
    [favorites, loading, isFavorite, toggleFavorite, refresh],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
