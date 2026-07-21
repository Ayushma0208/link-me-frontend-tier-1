'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Phone, PhoneOff, Video } from 'lucide-react'
import type { Socket } from 'socket.io-client'

import { api } from '@/lib/api'

const CallRoom = dynamic(
  () => import('@/components/calls/CallRoom').then((m) => m.CallRoom),
  { ssr: false }
)
import {
  connectCallSocket,
  type AgoraPayload,
  type CallSessionSummary,
} from '@/lib/call-socket'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/lib/utils'

interface AcceptCallResponse {
  call: CallSessionSummary
  agora?: AgoraPayload
}

/**
 * Listens for incoming paid video/voice calls.
 * Admins also poll ringing sessions so AI-creator calls can be answered
 * even if a socket event was missed.
 */
export function IncomingCallHost() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const [incoming, setIncoming] = useState<CallSessionSummary | null>(null)
  const [activeCallId, setActiveCallId] = useState<string | null>(null)
  const [activeAgora, setActiveAgora] = useState<AgoraPayload | null>(null)
  const [activeCallType, setActiveCallType] = useState<'AUDIO' | 'VIDEO'>(
    'VIDEO'
  )
  const [activePrice, setActivePrice] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeCallIdRef = useRef<string | null>(null)
  const busyRef = useRef(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    activeCallIdRef.current = activeCallId
  }, [activeCallId])

  useEffect(() => {
    busyRef.current = busy
  }, [busy])

  useEffect(() => {
    if (loading || !user?.id) return

    let socket: Socket | null = null
    let cancelled = false
    let poll: ReturnType<typeof setInterval> | undefined

    function applyIncoming(call: CallSessionSummary) {
      if (cancelled || !call?.id) return
      if (call.status !== 'RINGING') return
      if (activeCallIdRef.current || busyRef.current) return
      if (call.calleeId !== user?.id && !isAdmin) return
      // Always prefer the newest ringing call for this creator.
      setIncoming((prev) => {
        if (!prev || prev.id === call.id) return prev?.id === call.id ? prev : call
        const prevCreated = Date.parse(prev.createdAt ?? '') || 0
        const nextCreated = Date.parse(call.createdAt ?? '') || Date.now()
        if (prevCreated && nextCreated < prevCreated) return prev
        return call
      })
      setError(null)
    }

    async function pollRinging() {
      if (cancelled || activeCallIdRef.current || busyRef.current) return
      if (typeof document !== 'undefined' && document.hidden) return
      try {
        if (isAdmin) {
          const items = await api<CallSessionSummary[]>(
            '/calls/sessions/ringing'
          )
          const list = Array.isArray(items) ? items : []
          // Newest first from API — never keep a cancelled/stale banner.
          setIncoming(list[0] ?? null)
          setError(null)
          return
        }

        // Creators: recover if a socket ring was missed or replaced.
        const mine = await api<CallSessionSummary[]>(
          '/calls/sessions/me?page=1&limit=10&status=RINGING'
        )
        const list = Array.isArray(mine) ? mine : []
        const forMe = list.filter((c) => c.calleeId === user?.id)
        setIncoming(forMe[0] ?? null)
        setError(null)
      } catch (err) {
        // Don't spam the UI while the API is briefly restarting.
        if (activeCallIdRef.current) return
        if (isAdmin) {
          setError(
            err instanceof Error ? err.message : 'Could not load incoming calls'
          )
        }
      }
    }

    socket = connectCallSocket()
    if (socket) {
      socket.on('call:ringing', (payload: { call: CallSessionSummary }) => {
        if (payload?.call) applyIncoming(payload.call)
      })

      socket.on('call:ended', (payload: { call?: CallSessionSummary }) => {
        const endedId = payload.call?.id
        if (!endedId) return
        setIncoming((prev) => (prev?.id === endedId ? null : prev))
      })

      socket.on('call:accepted', (payload: { call?: CallSessionSummary }) => {
        const id = payload.call?.id
        if (!id) return
        setIncoming((prev) => (prev?.id === id ? null : prev))
      })
    }

    void pollRinging()
    // Socket is primary; poll less often so studio pages aren't starved on Neon.
    poll = setInterval(() => void pollRinging(), isAdmin ? 4000 : 8000)

    const onVisibility = () => {
      if (!document.hidden) void pollRinging()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      if (poll) clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisibility)
      socket?.disconnect()
    }
  }, [user?.id, isAdmin, loading])

  async function accept() {
    if (!incoming || busy) return
    setBusy(true)
    setError(null)
    const sessionId = incoming.id
    const callType = incoming.type === 'AUDIO' ? 'AUDIO' : 'VIDEO'
    const price = Number(incoming.pricePerMinute)
    try {
      const data = await api<AcceptCallResponse>(
        `/calls/sessions/${sessionId}/accept`,
        { method: 'POST' }
      )
      setActiveCallType(callType)
      setActivePrice(Number.isFinite(price) && price > 0 ? price : null)
      setActiveAgora(data.agora ?? null)
      setActiveCallId(sessionId)
      setIncoming(null)
      setError(null)
    } catch (err) {
      // Stale banner (cancelled/replaced call) — clear so the next ring can show.
      setIncoming(null)
      setError(err instanceof Error ? err.message : 'Could not accept call')
    } finally {
      setBusy(false)
    }
  }

  async function reject() {
    if (!incoming || busy) return
    setBusy(true)
    try {
      await api(`/calls/sessions/${incoming.id}/reject`, { method: 'POST' })
      setIncoming(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reject call')
    } finally {
      setBusy(false)
    }
  }

  function closeActiveCall() {
    setActiveCallId(null)
    setActiveAgora(null)
    setActivePrice(null)
  }

  const creatorLabel = incoming
    ? [
        incoming.calleeName,
        incoming.calleeUsername ? `@${incoming.calleeUsername}` : null,
      ]
        .filter(Boolean)
        .join(' ') || 'creator'
    : 'creator'
  const callerLabel =
    incoming?.callerName ||
    (incoming?.callerUsername ? `@${incoming.callerUsername}` : null) ||
    'Fan'
  const isVideoCall = incoming?.type === 'VIDEO'
  const CallIcon = isVideoCall ? Video : Phone

  return (
    <>
      {incoming && !activeCallId ? (
        <div className="fixed inset-x-0 top-3 z-[100] flex justify-center px-4 sm:top-5">
          <div className="w-full max-w-md rounded-3xl border border-emerald-400/30 bg-[#0f1412]/96 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="relative flex size-11 items-center justify-center rounded-2xl bg-emerald-500/20">
                <CallIcon className="size-5 text-emerald-300" />
                <span className="absolute -right-0.5 -top-0.5 flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  Incoming {isVideoCall ? 'video' : 'voice'} call
                  {isAdmin ? ` for ${creatorLabel}` : ''}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {callerLabel} ·{' '}
                  {formatCurrency(Number(incoming.pricePerMinute) || 0)}/min from
                  wallet
                </p>
                {error ? (
                  <p className="mt-2 text-xs text-red-300">{error}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void reject()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 text-sm font-semibold text-white/80 disabled:opacity-60"
              >
                <PhoneOff className="size-4" />
                Decline
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void accept()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 text-sm font-semibold text-white disabled:opacity-60"
              >
                <CallIcon className="size-4" />
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : isAdmin && error && !activeCallId ? (
        <div className="fixed inset-x-0 top-3 z-[100] flex justify-center px-4">
          <p className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            Call inbox: {error}
          </p>
        </div>
      ) : null}

      {activeCallId ? (
        <CallRoom
          callId={activeCallId}
          role="callee"
          initialAgora={activeAgora}
          initialCallType={activeCallType}
          initialPricePerMinute={activePrice}
          onEnd={closeActiveCall}
        />
      ) : null}
    </>
  )
}
