'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarClock, Loader2, Lock, Radio, Wallet } from 'lucide-react'
import { ApiError } from '@/lib/api'
import {
  getLive,
  joinLive,
  payLiveWithRazorpay,
  payLiveWithWallet,
  type AgoraCreds,
  type LiveDto,
} from '@/lib/live'
import { LiveRoom } from '@/components/live/LiveRoom'

interface LiveViewProps {
  liveId: string
}

type Phase =
  | 'loading'
  | 'scheduled'
  | 'subscribe'
  | 'payment'
  | 'granted'
  | 'ended'
  | 'error'

function formatWhen(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatCountdown(iso: string | null): string {
  if (!iso) return ''
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return ''
  const diff = target - Date.now()
  if (diff <= 0) return 'Starting soon…'
  const totalMin = Math.floor(diff / 60000)
  const days = Math.floor(totalMin / (60 * 24))
  const hours = Math.floor((totalMin % (60 * 24)) / 60)
  const mins = totalMin % 60
  const secs = Math.floor((diff % 60000) / 1000)
  if (days > 0) return `Starts in ${days}d ${hours}h`
  if (hours > 0) return `Starts in ${hours}h ${mins}m`
  if (totalMin > 0) return `Starts in ${mins}m ${secs}s`
  return `Starts in ${secs}s`
}

export function LiveView({ liveId }: LiveViewProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [live, setLive] = useState<LiveDto | null>(null)
  const [creds, setCreds] = useState<AgoraCreds | null>(null)
  const [price, setPrice] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState<'wallet' | 'razorpay' | null>(null)
  // Drives the live countdown re-render each second.
  const [, setTick] = useState(0)
  const phaseRef = useRef<Phase>('loading')
  phaseRef.current = phase

  const attemptJoin = useCallback(async () => {
    setError(null)
    try {
      const res = await joinLive(liveId)
      setLive(res.live)
      if (res.status === 'GRANTED') {
        setCreds(res.agora)
        setPhase('granted')
      } else {
        setPrice(res.price)
        setPhase('payment')
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : ''
      // Host hasn't started yet — keep the viewer in the waiting room.
      if (message.toLowerCase().includes('not started')) {
        setPhase('scheduled')
        return
      }
      try {
        const details = await getLive(liveId)
        setLive(details.live)
      } catch {
        // ignore
      }
      setError(
        message || 'Could not join this live. Please try again.'
      )
      setPhase('error')
    }
  }, [liveId])

  // Initial load: decide which screen to show based on status + access.
  const bootstrap = useCallback(async () => {
    try {
      const details = await getLive(liveId)
      setLive(details.live)
      if (details.live.status === 'ENDED') {
        setPhase('ended')
        return
      }
      if (!details.isSubscriber) {
        setPhase('subscribe')
        return
      }
      if (details.live.status === 'SCHEDULED') {
        setPhase('scheduled')
        return
      }
      await attemptJoin()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not open this live. Please try again.'
      )
      setPhase('error')
    }
  }, [liveId, attemptJoin])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  // While waiting for a scheduled live: tick the countdown + poll for start.
  useEffect(() => {
    if (phase !== 'scheduled') return
    const ticker = setInterval(() => setTick((t) => t + 1), 1000)
    const poll = setInterval(async () => {
      try {
        const details = await getLive(liveId)
        if (phaseRef.current !== 'scheduled') return
        setLive(details.live)
        if (details.live.status === 'LIVE') {
          await attemptJoin()
        } else if (details.live.status === 'ENDED') {
          setPhase('ended')
        }
      } catch {
        // ignore transient errors
      }
    }, 5000)
    return () => {
      clearInterval(ticker)
      clearInterval(poll)
    }
  }, [phase, liveId, attemptJoin])

  async function payWallet() {
    setPaying('wallet')
    setError(null)
    try {
      const res = await payLiveWithWallet(liveId)
      setLive(res.live)
      setCreds(res.agora)
      setPhase('granted')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Wallet payment failed')
    } finally {
      setPaying(null)
    }
  }

  async function payRazorpay() {
    setPaying('razorpay')
    setError(null)
    try {
      const res = await payLiveWithRazorpay(liveId)
      setLive(res.live)
      if (res.status === 'GRANTED') {
        setCreds(res.agora)
        setPhase('granted')
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Payment failed'
      if (msg !== 'Payment cancelled') setError(msg)
    } finally {
      setPaying(null)
    }
  }

  function leave() {
    router.push('/user')
  }

  if (phase === 'granted' && creds && live) {
    return (
      <LiveRoom
        creds={creds}
        liveId={live.id}
        emojiPrice={live.emojiPrice}
        title={live.title}
        subtitle={live.creator?.name ? `${live.creator.name} · Live` : 'Live'}
        onLeave={leave}
        onEnded={leave}
      />
    )
  }

  const creatorName = live?.creator?.name ?? 'This creator'

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07070b] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#141416] p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500">
          {phase === 'subscribe' ? (
            <Lock className="size-6 text-white" />
          ) : phase === 'scheduled' ? (
            <CalendarClock className="size-6 text-white" />
          ) : (
            <Radio className="size-6 text-white" />
          )}
        </span>

        {phase === 'loading' ? (
          <div className="mt-5 flex flex-col items-center gap-2">
            <Loader2 className="size-5 animate-spin text-white/60" />
            <p className="text-sm text-white/60">Opening live…</p>
          </div>
        ) : null}

        {phase === 'scheduled' && live ? (
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-rose-300/80 uppercase">
                Upcoming live
              </p>
              <h1 className="mt-1 text-lg font-bold text-white">{live.title}</h1>
              <p className="mt-1 text-[13px] text-white/50">
                {live.creator?.name
                  ? `${live.creator.name} will go live`
                  : 'This creator will go live'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-extrabold text-white">
                {formatCountdown(live.scheduledAt)}
              </p>
              <p className="mt-1 text-[13px] text-white/45">
                {formatWhen(live.scheduledAt)}
              </p>
            </div>
            <p className="text-[12px] text-white/40">
              {live.accessType === 'PAID'
                ? `Paid live · ₹${live.price ?? 0} — you'll be asked to pay when it starts`
                : 'Free for subscribers'}
            </p>
            <p className="text-[12px] text-white/35">
              Keep this page open — you&apos;ll join automatically when{' '}
              {live.creator?.name ?? 'the creator'} starts.
            </p>
            <button
              type="button"
              onClick={leave}
              className="text-[13px] text-white/40 transition hover:text-white/70"
            >
              Go back
            </button>
          </div>
        ) : null}

        {phase === 'subscribe' && live ? (
          <div className="mt-5 space-y-4">
            <div>
              <h1 className="text-lg font-bold text-white">{live.title}</h1>
              <p className="mt-1 text-[13px] text-white/50">
                {creatorName}
                {live.status === 'LIVE' ? ' is live now' : ' has a live'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[13px] text-white/70">
                This live is for subscribers only. Subscribe monthly to{' '}
                {creatorName} to join
                {live.accessType === 'PAID' ? ' (paid lives billed separately)' : ''}
                .
              </p>
            </div>
            {error ? <p className="text-[13px] text-rose-400">{error}</p> : null}
            <div className="grid gap-2.5">
              {live.creator?.username ? (
                <Link
                  href={`/${live.creator.username}`}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#07070b] transition hover:bg-white/90"
                >
                  Subscribe monthly
                </Link>
              ) : null}
              <button
                type="button"
                onClick={leave}
                className="text-[13px] text-white/40 transition hover:text-white/70"
              >
                Not now
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'payment' && live ? (
          <div className="mt-5 space-y-4">
            <div>
              <h1 className="text-lg font-bold text-white">{live.title}</h1>
              <p className="mt-1 text-[13px] text-white/50">
                {live.creator?.name
                  ? `${live.creator.name} is live now`
                  : 'Live now'}{' '}
                · Paid live
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[12px] text-white/40">Join price</p>
              <p className="mt-1 text-3xl font-extrabold text-white">
                ₹{price || live.price || 0}
              </p>
            </div>
            {error ? (
              <p className="text-[13px] text-rose-400">{error}</p>
            ) : null}
            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={payWallet}
                disabled={paying !== null}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white text-[14px] font-bold text-[#07070b] transition hover:bg-white/90 disabled:opacity-50"
              >
                {paying === 'wallet' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wallet className="size-4" />
                )}
                Pay from wallet
              </button>
              <button
                type="button"
                onClick={payRazorpay}
                disabled={paying !== null}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 text-[14px] font-semibold text-white/85 transition hover:bg-white/5 disabled:opacity-50"
              >
                {paying === 'razorpay' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Pay with Razorpay
              </button>
              <button
                type="button"
                onClick={leave}
                className="mt-1 text-[13px] text-white/40 transition hover:text-white/70"
              >
                Not now
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'ended' ? (
          <div className="mt-5 space-y-4">
            <div>
              <h1 className="text-lg font-bold text-white">This live has ended</h1>
              <p className="mt-1 text-[13px] text-white/50">
                {live?.creator?.name
                  ? `${live.creator.name}'s live has wrapped up.`
                  : 'This live has wrapped up.'}
              </p>
            </div>
            {live?.creator?.username ? (
              <Link
                href={`/${live.creator.username}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#07070b] transition hover:bg-white/90"
              >
                View {live.creator.name ?? 'creator'}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={leave}
              className="text-[13px] text-white/40 transition hover:text-white/70"
            >
              Go back
            </button>
          </div>
        ) : null}

        {phase === 'error' ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-white/70">
              {error ?? 'Unable to join this live.'}
            </p>
            {live?.creator?.username ? (
              <Link
                href={`/${live.creator.username}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#07070b] transition hover:bg-white/90"
              >
                View {live.creator.name ?? 'creator'}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={leave}
              className="text-[13px] text-white/40 transition hover:text-white/70"
            >
              Go back
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
