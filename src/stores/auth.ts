import { create } from 'zustand'
import type { AuthUser } from '@link-me/shared'
import { api, getTokens, setTokens } from '@/lib/api'
import {
  clearSavedAccounts,
  getSavedAccount,
  listSavedAccounts,
  removeSavedAccount,
  upsertSavedAccount,
} from '@/lib/accounts'
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
  logoutAll: () => void
  revokeAllDevices: () => Promise<void>
  switchAccount: (userId: string) => Promise<void>
  /** Removes active account; returns true if another account was promoted. */
  signOutCurrent: () => Promise<boolean>
  fetchMe: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

async function applyAuthResult(result: BackendAuthResult) {
  const tokens = mapBackendTokens(result.tokens)
  setTokens(tokens)
  const user = mapBackendUser(result.user)
  upsertSavedAccount(user, tokens)
  return user
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
    void get().signOutCurrent()
  },

  signOutCurrent: async () => {
    const tokens = getTokens()
    if (tokens?.refreshToken) {
      try {
        await api('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        })
      } catch {
        // best-effort server revoke
      }
    }
    const current = get().user
    if (current) removeSavedAccount(current.id)
    const remaining = listSavedAccounts()
    if (remaining[0]) {
      setTokens({
        accessToken: remaining[0].accessToken,
        refreshToken: remaining[0].refreshToken,
      })
      try {
        const data = await api<{ user: BackendPublicUser }>('/auth/me')
        const user = mapBackendUser(data.user)
        const nextTokens = getTokens()
        if (nextTokens) upsertSavedAccount(user, nextTokens)
        setLocaleCookie(resolveLocale(user.locale))
        set({ user, loading: false })
        return true
      } catch {
        clearSavedAccounts()
        setTokens(null)
        set({ user: null, loading: false })
        return false
      }
    }
    setTokens(null)
    set({ user: null })
    return false
  },

  logoutAll: () => {
    clearSavedAccounts()
    setTokens(null)
    set({ user: null })
  },

  revokeAllDevices: async () => {
    try {
      await api('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ allDevices: true }),
      })
    } catch {
      // best-effort; still clear local session
    }
    clearSavedAccounts()
    setTokens(null)
    set({ user: null })
  },

  switchAccount: async (userId: string) => {
    const account = getSavedAccount(userId)
    if (!account) throw new Error('Account not found on this device')
    setTokens({
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
    })
    const data = await api<{ user: BackendPublicUser }>('/auth/me')
    const user = mapBackendUser(data.user)
    const tokens = getTokens()
    if (tokens) upsertSavedAccount(user, tokens)
    setLocaleCookie(resolveLocale(user.locale))
    set({ user, loading: false })
  },

  fetchMe: async () => {
    try {
      const data = await api<{ user: BackendPublicUser }>('/auth/me')
      const user = mapBackendUser(data.user)
      const tokens = getTokens()
      if (tokens) upsertSavedAccount(user, tokens)
      setLocaleCookie(resolveLocale(user.locale))
      set({ user, loading: false })
    } catch {
      setTokens(null)
      set({ user: null, loading: false })
    }
  },

  setUser: (user) => set({ user }),
}))
