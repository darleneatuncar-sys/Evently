import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearStoredToken, getStoredToken, setStoredToken } from '../services/api'
import { authService } from '../services/authService'
import type { LoginPayload, RegisterPayload, User } from '../types'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setLoading(false)
      return
    }

    authService
      .me()
      .then(setUser)
      .catch(() => {
        clearStoredToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { token, user: loggedUser } = await authService.login(payload)
    setStoredToken(token)
    setUser(loggedUser)
    return loggedUser
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
