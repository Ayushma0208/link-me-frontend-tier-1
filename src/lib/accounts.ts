import type { AuthTokens, AuthUser } from '@link-me/shared'

const ACCOUNTS_KEY = 'linkme_accounts'
const MAX_ACCOUNTS = 5

export type SavedAccount = {
  userId: string
  email: string
  name: string
  username: string
  avatar: string | null
  role: AuthUser['role']
  accessToken: string
  refreshToken: string
}

export function listSavedAccounts(): SavedAccount[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as SavedAccount[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ACCOUNTS) : []
  } catch {
    return []
  }
}

function writeAccounts(accounts: SavedAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts.slice(0, MAX_ACCOUNTS)))
}

export function upsertSavedAccount(user: AuthUser, tokens: AuthTokens) {
  if (typeof window === 'undefined') return
  const next: SavedAccount = {
    userId: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    avatar: user.avatar ?? null,
    role: user.role,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
  const existing = listSavedAccounts().filter((a) => a.userId !== user.id)
  writeAccounts([next, ...existing])
}

export function removeSavedAccount(userId: string) {
  if (typeof window === 'undefined') return
  writeAccounts(listSavedAccounts().filter((a) => a.userId !== userId))
}

export function clearSavedAccounts() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCOUNTS_KEY)
}

export function getSavedAccount(userId: string) {
  return listSavedAccounts().find((a) => a.userId === userId) ?? null
}

export function canAddAccount() {
  return listSavedAccounts().length < MAX_ACCOUNTS
}

export { MAX_ACCOUNTS }
