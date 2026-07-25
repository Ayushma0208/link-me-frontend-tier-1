import { create } from 'zustand'
import type { AuthUser } from '@link-me/shared'
import { api, setTokens } from '@/lib/api'
import {
  mapBackendTokens,
  mapBackendUser,
  toBackendRole,
  type BackendAuthResult,
  type BackendPublicUser,
} from '@/lib/auth-map'
import { requestGoogleIdToken } from '@/lib/google-auth'
import { resolveLocale } from '@/i18n/config'
import { getClientLocale, setLocaleCookie } from '@/lib/locale-cookie'
import { browserTimezone } from '@/lib/timezone'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (role?: 'creator' | 'user') => Promise<void>
  register: (input: {
    email: string
    password: string
    name: string
    username: string
    role: 'creator' | 'user'
  }) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

async function applyAuthResult(result: BackendAuthResult) {
  setTokens(mapBackendTokens(result.tokens))
  return mapBackendUser(result.user)
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const locale = getClientLocale()
    const data = await api<BackendAuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        timezone: browserTimezone(),
        locale,
      }),
    })
    const user = await applyAuthResult(data)
    setLocaleCookie(resolveLocale(user.locale))
    set({ user })
  },

  loginWithGoogle: async (role = 'user') => {
    const idToken = await requestGoogleIdToken(
      role === 'creator' ? 'signup' : 'signin'
    )
    const locale = getClientLocale()
    const data = await api<BackendAuthResult>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        idToken,
        role: toBackendRole(role),
        timezone: browserTimezone(),
        locale,
      }),
    })
    const user = await applyAuthResult(data)
    setLocaleCookie(resolveLocale(user.locale))
    set({ user })
  },

  register: async (input) => {
    const locale = getClientLocale()
    const data = await api<BackendAuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        displayName: input.name,
        username: input.username,
        role: toBackendRole(input.role),
        timezone: browserTimezone(),
        locale,
      }),
    })
    const user = await applyAuthResult(data)
    setLocaleCookie(resolveLocale(user.locale))
    set({ user })
  },

  logout: () => {
    setTokens(null)
    set({ user: null })
  },

  fetchMe: async () => {
    try {
      const data = await api<{ user: BackendPublicUser }>('/auth/me')
      const user = mapBackendUser(data.user)
      setLocaleCookie(resolveLocale(user.locale))
      set({ user, loading: false })
    } catch {
      setTokens(null)
      set({ user: null, loading: false })
    }
  },

  setUser: (user) => set({ user }),
}))
