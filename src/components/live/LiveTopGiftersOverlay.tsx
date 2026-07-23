'use client'

import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { Trophy } from 'lucide-react'
import {
  connectLiveSocket,
  type LiveGiftLeaderboardEntry,
  type LiveGiftLeaderboardPayload,
} from '@/lib/live-socket'
import { formatCurrency, cn } from '@/lib/utils'

interface LiveTopGiftersOverlayProps {
  liveId: string
}

function rankAccent(rank: number) {
  if (rank === 1) return 'text-amber-300'
  if (rank === 2) return 'text-white/70'
  if (rank === 3) return 'text-orange-300/80'
  return 'text-white/40'
}

export function LiveTopGiftersOverlay({ liveId }: LiveTopGiftersOverlayProps) {
  const [entries, setEntries] = useState<LiveGiftLeaderboardEntry[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = connectLiveSocket()
    if (!socket) return
    socketRef.current = socket

    const join = () => {
      socket.emit('live:join', { liveId })
    }

    const applyBoard = (payload: LiveGiftLeaderboardPayload | null | undefined) => {
      if (!payload || payload.liveId !== liveId) return
      setEntries(Array.isArray(payload.entries) ? payload.entries.slice(0, 5) : [])
    }

    const onJoined = (payload: {
      giftLeaderboard?: LiveGiftLeaderboardPayload | null
    }) => {
      applyBoard(payload.giftLeaderboard ?? null)
    }

    const onBoard = (payload: LiveGiftLeaderboardPayload) => {
      applyBoard(payload)
    }

    socket.on('live:joined', onJoined)
    socket.on('live:gift-leaderboard', onBoard)
    socket.on('connect', join)
    socket.on('reconnect', join)
    if (socket.connected) join()
    else socket.connect()

    return () => {
      socket.off('live:joined', onJoined)
      socket.off('live:gift-leaderboard', onBoard)
      socket.off('connect', join)
      socket.off('reconnect', join)
      socket.disconnect()
      socketRef.current = null
    }
  }, [liveId])

  if (entries.length === 0) return null

  return (
    <div className="pointer-events-none absolute top-3 left-3 z-[34] w-[min(calc(100%-1.5rem),15rem)] sm:top-4 sm:left-4">
      <div className="rounded-2xl border border-white/15 bg-black/75 p-3 shadow-xl backdrop-blur-md">
        <div className="mb-2 flex items-center gap-1.5">
          <Trophy className="size-3.5 text-amber-300" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">
            Top gifters
          </p>
        </div>
        <ul className="space-y-1.5">
          {entries.map((entry) => (
            <li
              key={entry.user.id}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5"
            >
              <span
                className={cn(
                  'w-4 shrink-0 text-center text-[11px] font-bold tabular-nums',
                  rankAccent(entry.rank)
                )}
              >
                {entry.rank}
              </span>
              {entry.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.user.avatarUrl}
                  alt=""
                  className="size-6 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white/70">
                  {(entry.user.username?.[0] ?? '?').toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-white">
                  @{entry.user.username}
                </p>
                <p className="text-[10px] text-white/40">
                  {entry.giftCount} gift{entry.giftCount === 1 ? '' : 's'}
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-bold tabular-nums text-amber-200/90">
                {formatCurrency(entry.totalAmount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
