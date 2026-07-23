'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Socket } from 'socket.io-client'
import { BarChart3, Plus, X } from 'lucide-react'
import {
  connectLiveSocket,
  type LivePollDto,
} from '@/lib/live-socket'
import { cn } from '@/lib/utils'

interface LivePollOverlayProps {
  liveId: string
  isHost: boolean
  /** Host toolbar mount point (next to Ultra-low / Normal). */
  hostToolbarEl?: HTMLElement | null
}

export function LivePollOverlay({
  liveId,
  isHost,
  hostToolbarEl = null,
}: LivePollOverlayProps) {
  const [poll, setPoll] = useState<LivePollDto | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
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

    const applyPoll = (incoming: LivePollDto) => {
      setPoll((prev) => {
        const myVote =
          incoming.myVoteOptionId ??
          (prev?.id === incoming.id ? prev.myVoteOptionId : null)
        return { ...incoming, myVoteOptionId: myVote }
      })
    }

    const onJoined = (payload: { activePoll?: LivePollDto | null }) => {
      if (payload.activePoll) applyPoll(payload.activePoll)
      else setPoll(null)
      setError(null)
    }

    const onPoll = (payload: LivePollDto) => {
      if (!payload?.id) return
      applyPoll(payload)
    }

    const onClosed = (payload: LivePollDto) => {
      if (!payload?.id) return
      applyPoll({ ...payload, status: 'CLOSED' })
    }

    const onError = (payload: { message?: string }) => {
      setError(payload?.message ?? 'Poll error')
      setBusy(false)
    }

    socket.on('live:joined', onJoined)
    socket.on('live:poll', onPoll)
    socket.on('live:poll-closed', onClosed)
    socket.on('live:error', onError)
    socket.on('connect', join)
    socket.on('reconnect', join)
    if (socket.connected) join()
    else socket.connect()

    return () => {
      socket.off('live:joined', onJoined)
      socket.off('live:poll', onPoll)
      socket.off('live:poll-closed', onClosed)
      socket.off('live:error', onError)
      socket.off('connect', join)
      socket.off('reconnect', join)
      socket.disconnect()
      socketRef.current = null
    }
  }, [liveId])

  function createPoll() {
    const q = question.trim()
    const opts = options.map((o) => o.trim()).filter(Boolean)
    if (!q || opts.length < 2 || busy) return
    setBusy(true)
    setError(null)
    socketRef.current?.emit('live:poll-create', {
      liveId,
      question: q,
      options: opts.slice(0, 4),
    })
    setComposerOpen(false)
    setQuestion('')
    setOptions(['', ''])
    setBusy(false)
  }

  function vote(optionId: string) {
    if (!poll || poll.status !== 'OPEN' || poll.myVoteOptionId || busy) return
    setBusy(true)
    setError(null)
    setPoll((p) => (p ? { ...p, myVoteOptionId: optionId } : p))
    socketRef.current?.emit('live:poll-vote', {
      liveId,
      pollId: poll.id,
      optionId,
    })
    setBusy(false)
  }

  function closePoll() {
    if (!poll || busy) return
    setBusy(true)
    socketRef.current?.emit('live:poll-close', {
      liveId,
      pollId: poll.id,
    })
    setBusy(false)
  }

  const showResults =
    Boolean(poll) &&
    (isHost || poll?.myVoteOptionId != null || poll?.status === 'CLOSED')

  const canStartNew = !poll || poll.status === 'CLOSED'
  const hostToolbar =
    isHost && hostToolbarEl ? (
      <div className="relative">
        {poll?.status === 'OPEN' ? (
          <button
            type="button"
            disabled={busy}
            onClick={closePoll}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <BarChart3 className="size-3.5" />
            End poll
          </button>
        ) : (
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
            <BarChart3 className="size-3.5" />
            Poll
          </button>
        )}

        {composerOpen && canStartNew ? (
          <div className="absolute right-0 top-[calc(100%+8px)] z-[60] w-[min(100vw-2rem,18rem)] rounded-2xl border border-white/15 bg-[#12121a]/95 p-3.5 shadow-xl backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-wide text-white/50">
                New poll
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
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              maxLength={200}
              className="mb-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/35"
            />
            <div className="space-y-1.5">
              {options.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={(e) => {
                    const next = [...options]
                    next[i] = e.target.value
                    setOptions(next)
                  }}
                  placeholder={`Option ${i + 1}`}
                  maxLength={100}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/35"
                />
              ))}
            </div>
            {options.length < 4 ? (
              <button
                type="button"
                onClick={() => setOptions((o) => [...o, ''])}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 hover:text-sky-200"
              >
                <Plus className="size-3" />
                Add option
              </button>
            ) : null}
            <button
              type="button"
              disabled={
                busy ||
                !question.trim() ||
                options.map((o) => o.trim()).filter(Boolean).length < 2
              }
              onClick={createPoll}
              className="mt-3 w-full rounded-full bg-white py-2 text-[13px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"
            >
              Launch poll
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

      {/* Compact card — top-right of the video, not centered */}
      {poll ? (
        <div className="pointer-events-none absolute top-3 right-3 z-[35] w-[min(calc(100%-1.5rem),16rem)] sm:top-4 sm:right-4">
          <div className="pointer-events-auto rounded-2xl border border-white/15 bg-black/75 p-3 shadow-xl backdrop-blur-md">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {poll.status === 'OPEN' ? 'Live poll' : 'Poll ended'}
                </p>
                <p className="text-[13px] font-semibold leading-snug text-white">
                  {poll.question}
                </p>
              </div>
              {isHost && poll.status === 'OPEN' && !hostToolbarEl ? (
                <button
                  type="button"
                  onClick={closePoll}
                  className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[11px] font-semibold text-white/70 hover:bg-white/10"
                >
                  End
                </button>
              ) : null}
            </div>

            <div className="space-y-1.5">
              {poll.options.map((opt) => {
                const selected = poll.myVoteOptionId === opt.id
                const canVote =
                  !isHost &&
                  poll.status === 'OPEN' &&
                  poll.myVoteOptionId == null
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!canVote || busy}
                    onClick={() => vote(opt.id)}
                    className={cn(
                      'relative w-full overflow-hidden rounded-xl border px-2.5 py-2 text-left transition',
                      selected
                        ? 'border-sky-400/60 bg-sky-500/15'
                        : 'border-white/12 bg-white/5',
                      canVote && 'hover:border-white/30 hover:bg-white/10',
                      !canVote && 'cursor-default'
                    )}
                  >
                    {showResults ? (
                      <span
                        className="absolute inset-y-0 left-0 bg-white/10 transition-[width] duration-500"
                        style={{ width: `${Math.min(100, opt.percent)}%` }}
                      />
                    ) : null}
                    <span className="relative z-10 flex items-center justify-between gap-2">
                      <span className="text-[12px] font-medium text-white">
                        {opt.label}
                      </span>
                      {showResults ? (
                        <span className="shrink-0 text-[11px] font-bold tabular-nums text-white/80">
                          {opt.percent}%
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="mt-2 text-[10px] text-white/40">
              {poll.totalVotes} vote{poll.totalVotes === 1 ? '' : 's'}
              {!isHost && poll.status === 'OPEN' && !poll.myVoteOptionId
                ? ' · tap to vote'
                : null}
            </p>
          </div>
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
