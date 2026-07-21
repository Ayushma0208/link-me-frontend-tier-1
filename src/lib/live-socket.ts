import { io, type Socket } from 'socket.io-client'
import { getTokens } from '@/lib/api'

export interface LiveChatUser {
  id: string
  username: string
  name: string
  avatarUrl: string | null
}

export interface LiveChatMessage {
  id: string
  liveId: string
  kind: 'TEXT' | 'EMOJI'
  body: string
  amountCharged: number
  createdAt: string
  user: LiveChatUser
}

export interface LiveBrbPayload {
  liveId: string
  isPaused: boolean
  brbMessage: string | null
  brbImageUrl: string | null
  pausedAt: string | null
}

export interface LiveLatencyPayload {
  liveId: string
  latencyMode: 'ULTRA_LOW' | 'NORMAL'
}

function socketOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  if (api.startsWith('http://') || api.startsWith('https://')) {
    return api.replace(/\/api(?:\/v1)?\/?$/, '')
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000'
}

/** Connect to the /live Socket.IO namespace with the current access token. */
export function connectLiveSocket(): Socket | null {
  const token = getTokens()?.accessToken
  if (!token) return null
  return io(`${socketOrigin()}/live`, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 8,
  })
}
