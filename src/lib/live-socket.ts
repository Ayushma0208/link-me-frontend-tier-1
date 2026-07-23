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
  kind: 'TEXT' | 'EMOJI' | 'GIFT'
  body: string
  amountCharged: number
  createdAt: string
  giftId?: string
  giftLabel?: string
  giftEmoji?: string
  user: LiveChatUser
}

export interface LivePinnedPayload {
  liveId: string
  message: LiveChatMessage | null
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

export interface LiveRaidPayload {
  fromLiveId: string
  targetLiveId: string
  target: {
    id: string
    title: string
    status?: string
    creator?: {
      id?: string
      username?: string
      name?: string
      avatarUrl?: string | null
    }
  }
}

export interface LivePollOptionDto {
  id: string
  label: string
  sortOrder: number
  votes: number
  percent: number
}

export interface LivePollDto {
  id: string
  liveId: string
  question: string
  status: 'OPEN' | 'CLOSED'
  totalVotes: number
  myVoteOptionId: string | null
  options: LivePollOptionDto[]
  createdAt: string
  closedAt: string | null
}

export interface LiveGoalDto {
  id: string
  liveId: string
  type: 'SUB' | 'GIFT'
  label: string
  target: number
  current: number
  status: 'ACTIVE' | 'CLEARED' | 'COMPLETED'
  createdAt: string
  completedAt: string | null
  clearedAt: string | null
}

export interface LiveGoalProgressPayload {
  liveId: string
  goalId: string
  type: 'SUB' | 'GIFT'
  label: string
  current: number
  target: number
  status: 'ACTIVE' | 'CLEARED' | 'COMPLETED'
}

export interface LiveGiftLeaderboardEntry {
  rank: number
  totalAmount: number
  giftCount: number
  user: LiveChatUser
}

export interface LiveGiftLeaderboardPayload {
  liveId: string
  entries: LiveGiftLeaderboardEntry[]
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
