import type { AuthTokens, AuthUser, UserRole } from '@link-me/shared'

/** Backend auth-service public user (platform microservice). */
export interface BackendPublicUser {
  id: string
  email: string
  username: string
  displayName: string
  role: string
  status?: string
  avatarUrl?: string | null
  emailVerifiedAt?: string | null
  createdAt?: string
}

export interface BackendAuthResult {
  user: BackendPublicUser
  tokens: {
    accessToken: string
    refreshToken: string
    tokenType?: string
    expiresIn?: string
  }
}

function mapRole(role: string): UserRole {
  const normalized = role.trim().toLowerCase()
  if (normalized === 'admin' || normalized === 'moderator') return 'admin'
  if (normalized === 'creator') return 'creator'
  return 'user'
}

export function mapBackendUser(user: BackendPublicUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.displayName,
    username: user.username,
    role: mapRole(user.role),
    avatar: user.avatarUrl ?? null,
    walletBalance: 0,
  }
}

export function mapBackendTokens(
  tokens: BackendAuthResult['tokens']
): AuthTokens {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

export function toBackendRole(role: 'creator' | 'user'): 'CREATOR' | 'USER' {
  return role === 'creator' ? 'CREATOR' : 'USER'
}
