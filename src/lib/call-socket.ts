import { io, type Socket } from 'socket.io-client'
import { getTokens } from '@/lib/api'

export interface AgoraPayload {
  appId: string
  channel: string
  token: string
  uid?: number
  mock?: boolean
}

export interface CallSessionSummary {
  id: string
  callerId: string
  calleeId: string
  type: string
  status: string
  pricePerMinute: string
  currency: string
  createdAt?: string
  callerUsername?: string | null
  callerName?: string | null
  calleeUsername?: string | null
  calleeName?: string | null
}

function socketOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  if (api.startsWith('http://') || api.startsWith('https://')) {
    return api.replace(/\/api(?:\/v1)?\/?$/, '')
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000'
}

/** Connect to the /calls Socket.IO namespace with the current access token. */
export function connectCallSocket(): Socket | null {
  const token = getTokens()?.accessToken
  if (!token) return null
  return io(`${socketOrigin()}/calls`, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 8,
  })
}
