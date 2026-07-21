import { io, type Socket } from 'socket.io-client'
import { getTokens } from '@/lib/api'

function socketOrigin(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? '/api'
  if (api.startsWith('http://') || api.startsWith('https://')) {
    return api.replace(/\/api(?:\/v1)?\/?$/, '')
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000'
}

export function connectChatSocket(): Socket | null {
  const token = getTokens()?.accessToken
  if (!token) return null
  return io(`${socketOrigin()}/chat`, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 8,
  })
}
