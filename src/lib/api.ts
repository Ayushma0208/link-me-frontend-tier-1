const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getTokens() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('linkme_auth')
  if (!raw) return null
  try {
    return JSON.parse(raw) as { accessToken: string; refreshToken: string }
  } catch {
    return null
  }
}

export function setTokens(tokens: { accessToken: string; refreshToken: string } | null) {
  if (typeof window === 'undefined') return
  if (tokens) localStorage.setItem('linkme_auth', JSON.stringify(tokens))
  else localStorage.removeItem('linkme_auth')
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const tokens = getTokens()
    if (!tokens?.refreshToken) return null

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    })

    if (!res.ok) {
      setTokens(null)
      return null
    }

    const data = await unwrapJson<{
      tokens: { accessToken: string; refreshToken: string }
    }>(res)
    setTokens(data.tokens)
    return data.tokens.accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const tokens = getTokens()
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (tokens?.accessToken) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401 && retry && tokens?.refreshToken) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`)
      const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers })
      if (!retryRes.ok) {
        throw new ApiError(await readErrorMessage(retryRes), retryRes.status)
      }
      return unwrapJson<T>(retryRes)
    }
  }

  if (!res.ok) {
    throw new ApiError(await readErrorMessage(res), res.status)
  }

  if (res.status === 204) return undefined as T
  return unwrapJson<T>(res)
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => '')
  try {
    const err = text ? (JSON.parse(text) as {
      message?: string
      error?: { message?: string } | string
    }) : {}
    if (typeof err.error === 'object' && err.error?.message) return err.error.message
    if (typeof err.error === 'string') return err.error
    if (err.message) return err.message
  } catch {
    // non-JSON (proxy HTML / empty body while API restarts)
  }
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    return 'Server temporarily unavailable — try again'
  }
  return text?.trim() || 'Request failed'
}

/** Gateway/microservices return `{ success, data }`; legacy Nest returned the payload directly. */
async function unwrapJson<T>(res: Response): Promise<T> {
  const json = await res.json()
  if (
    json &&
    typeof json === 'object' &&
    'success' in json &&
    (json as { success: unknown }).success === true &&
    'data' in json
  ) {
    return (json as { data: T }).data
  }
  return json as T
}

export function getSocketUrl() {
  if (typeof window === 'undefined') return ''

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL
  if (socketUrl) return socketUrl

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl && apiUrl !== '/api') {
    return apiUrl.replace(/\/api\/?$/, '')
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:4000'
  }

  return window.location.origin
}
