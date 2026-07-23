'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Socket } from 'socket.io-client'
import { Target, X } from 'lucide-react'
import {
  connectLiveSocket,
  type LiveGoalDto,
  type LiveGoalProgressPayload,
} from '@/lib/live-socket'
import { cn } from '@/lib/utils'

interface LiveMilestoneOverlayProps {
  liveId: string
  isHost: boolean
  /** Host toolbar mount point (next to Poll). */
  hostToolbarEl?: HTMLElement | null
}

function applyGoalList(
  prev: LiveGoalDto[],
  incoming: LiveGoalDto
): LiveGoalDto[] {
  if (incoming.status === 'CLEARED') {
    return prev.filter((g) => g.id !== incoming.id)
  }
  const withoutSameType = prev.filter((g) => g.type !== incoming.type)
  return [...withoutSameType, incoming].sort((a, b) =>
    a.type.localeCompare(b.type)
  )
}

export function LiveMilestoneOverlay({
  liveId,
  isHost,
  hostToolbarEl = null,
}: LiveMilestoneOverlayProps) {
  const [goals, setGoals] = useState<LiveGoalDto[]>([])
  const [composerOpen, setComposerOpen] = useState(false)
  const [goalType, setGoalType] = useState<'SUB' | 'GIFT'>('GIFT')
  const [target, setTarget] = useState('100')
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = connectLiveSocket()
    if (!socket) return
    socketRef.current = socket

    const join = () => {
      socket.emit('live:join', { liveId })
    }

    const onJoined = (payload: { activeGoals?: LiveGoalDto[] | null }) => {
      const list = Array.isArray(payload.activeGoals)
        ? payload.activeGoals.filter(
            (g) => g.status === 'ACTIVE' || g.status === 'COMPLETED'
          )
        : []
      setGoals(list.sort((a, b) => a.type.localeCompare(b.type)))
      setError(null)
    }

    const onGoal = (payload: LiveGoalDto) => {
      if (!payload?.id) return
      setGoals((prev) => applyGoalList(prev, payload))
      setBusy(false)
    }

    const onProgress = (payload: LiveGoalProgressPayload) => {
      if (!payload?.goalId) return
      setGoals((prev) => {
        const existing = prev.find((g) => g.id === payload.goalId)
        const next: LiveGoalDto = {
          id: payload.goalId,
          liveId: payload.liveId,
          type: payload.type,
          label: payload.label,
          target: payload.target,
          current: payload.current,
          status: payload.status,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          completedAt:
            payload.status === 'COMPLETED'
              ? (existing?.completedAt ?? new Date().toISOString())
              : null,
          clearedAt: payload.status === 'CLEARED' ? new Date().toISOString() : null,
        }
        return applyGoalList(prev, next)
      })
    }

    const onError = (payload: { message?: string }) => {
      setError(payload?.message ?? 'Goal error')
      setBusy(false)
    }

    socket.on('live:joined', onJoined)
    socket.on('live:goal', onGoal)
    socket.on('live:goal-progress', onProgress)
    socket.on('live:error', onError)
    socket.on('connect', join)
    socket.on('reconnect', join)
    if (socket.connected) join()
    else socket.connect()

    return () => {
      socket.off('live:joined', onJoined)
      socket.off('live:goal', onGoal)
      socket.off('live:goal-progress', onProgress)
      socket.off('live:error', onError)
      socket.off('connect', join)
      socket.off('reconnect', join)
      socket.disconnect()
      socketRef.current = null
    }
  }, [liveId])

  function createGoal() {
    const t = Math.floor(Number(target))
    if (!Number.isFinite(t) || t < 1 || busy) return
    setBusy(true)
    setError(null)
    socketRef.current?.emit('live:goal-create', {
      liveId,
      type: goalType,
      target: t,
      label: label.trim() || null,
    })
    setComposerOpen(false)
    setLabel('')
    setTarget('100')
  }

  function clearGoal(goalId: string) {
    if (busy) return
    setBusy(true)
    setError(null)
    socketRef.current?.emit('live:goal-clear', { liveId, goalId })
  }

  const visibleGoals = goals.filter(
    (g) => g.status === 'ACTIVE' || g.status === 'COMPLETED'
  )

  const hostToolbar =
    isHost && hostToolbarEl ? (
      <div className="relative">
        <button
          type="button"
          onClick={() => setComposerOpen((v) => !v)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-semibold transition',
            composerOpen
              ? 'border-white bg-white text-black'
              : 'border-white/15 bg-white/10 text-white hover:bg-white/20'
          )}
        >
          <Target className="size-3.5" />
          Goal
        </button>

        {composerOpen ? (
          <div className="absolute right-0 top-[calc(100%+8px)] z-[60] w-[min(100vw-2rem,17rem)] rounded-2xl border border-white/15 bg-[#12121a]/95 p-3.5 shadow-xl backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-wide text-white/50">
                Milestone goal
              </p>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Close composer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mb-2 flex gap-1.5">
              {(['GIFT', 'SUB'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGoalType(t)}
                  className={cn(
                    'flex-1 rounded-full border px-2 py-1.5 text-[11px] font-semibold transition',
                    goalType === t
                      ? 'border-white bg-white text-black'
                      : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
                  )}
                >
                  {t === 'GIFT' ? 'Gift' : 'Sub'}
                </button>
              ))}
            </div>

            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={
                goalType === 'GIFT' ? 'Gift Goal (optional)' : 'Sub Goal (optional)'
              }
              maxLength={40}
              className="mb-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/35"
            />
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="Target count"
              inputMode="numeric"
              className="mb-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/35"
            />

            {visibleGoals.length > 0 ? (
              <div className="mb-2 space-y-1">
                {visibleGoals.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5"
                  >
                    <span className="truncate text-[11px] text-white/70">
                      {g.label}: {g.current}/{g.target}
                      {g.status === 'COMPLETED' ? ' ✓' : ''}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => clearGoal(g.id)}
                      className="shrink-0 text-[10px] font-semibold text-rose-300 hover:text-rose-200 disabled:opacity-50"
                    >
                      Clear
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              disabled={busy || !target || Number(target) < 1}
              onClick={createGoal}
              className="w-full rounded-full bg-white py-2 text-[13px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"
            >
              Launch goal
            </button>
          </div>
        ) : null}
      </div>
    ) : null

  return (
    <>
      {hostToolbar && hostToolbarEl
        ? createPortal(hostToolbar, hostToolbarEl)
        : null}

      {visibleGoals.length > 0 ? (
        <div className="pointer-events-none absolute top-3 left-1/2 z-[33] flex w-[min(calc(100%-1.5rem),20rem)] -translate-x-1/2 flex-col gap-1.5 sm:top-4">
          {visibleGoals.map((g) => {
            const pct = Math.min(
              100,
              g.target > 0 ? Math.round((g.current / g.target) * 1000) / 10 : 0
            )
            const done = g.status === 'COMPLETED' || g.current >= g.target
            return (
              <div
                key={g.id}
                className={cn(
                  'rounded-xl border px-3 py-2 shadow-lg backdrop-blur-md',
                  done
                    ? 'border-emerald-400/40 bg-emerald-950/70'
                    : 'border-white/15 bg-black/70'
                )}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] font-semibold text-white">
                    {g.label}:{' '}
                    <span className="tabular-nums">
                      {g.current}/{g.target}
                    </span>
                  </p>
                  {done ? (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                      Done
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-semibold tabular-nums text-white/45">
                      {pct}%
                    </span>
                  )}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width] duration-500',
                      done
                        ? 'bg-emerald-400'
                        : g.type === 'SUB'
                          ? 'bg-sky-400'
                          : 'bg-amber-400'
                    )}
                    style={{ width: `${done ? 100 : pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {error ? (
        <p className="pointer-events-auto absolute top-3 left-1/2 z-[36] -translate-x-1/2 rounded-full bg-rose-600/85 px-3 py-1 text-[11px] text-white">
          {error}
        </p>
      ) : null}
    </>
  )
}
