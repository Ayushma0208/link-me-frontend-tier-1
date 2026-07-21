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
    const data = await api<BackendAuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const user = await applyAuthResult(data)
    set({ user })
  },

  loginWithGoogle: async (role = 'user') => {
    const idToken = await requestGoogleIdToken(
      role === 'creator' ? 'signup' : 'signin'
    )
    const data = await api<BackendAuthResult>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        idToken,
        role: toBackendRole(role),
      }),
    })
    const user = await applyAuthResult(data)
    set({ user })
  },

  register: async (input) => {
    const data = await api<BackendAuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        displayName: input.name,
        username: input.username,
        role: toBackendRole(input.role),
      }),
    })
    const user = await applyAuthResult(data)
    set({ user })
  },

  logout: () => {
    setTokens(null)
    set({ user: null })
  },

  fetchMe: async () => {
    try {
      const data = await api<{ user: BackendPublicUser }>('/auth/me')
      set({ user: mapBackendUser(data.user), loading: false })
    } catch {
      setTokens(null)
      set({ user: null, loading: false })
    }
  },

  setUser: (user) => set({ user }),
}))
