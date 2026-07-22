'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  BellOff,
  CalendarClock,
  Loader2,
  Lock,
  Radio,
  Wallet,
} from 'lucide-react'
import { ApiError } from '@/lib/api'
import {
  getLive,
  joinLive,
  notifyMeLive,
  payLiveWithRazorpay,
  payLiveWithWallet,
  unnotifyMeLive,
  type AgoraCreds,
  type LiveDto,
} from '@/lib/live'
import {
  formatPremiereWhen,
  getCountdownParts,
} from '@/lib/premiere-countdown'
import { LiveRoom } from '@/components/live/LiveRoom'

interface LiveViewProps {
  liveId: string
}

type Phase =
  | 'loading'
  | 'scheduled'
  | 'preparing'
  | 'subscribe'
  | 'payment'
  | 'granted'
  | 'ended'
  | 'error'

function CountdownBlocks({ iso }: { iso: string | null }) {
  const parts = getCountdownParts(iso)
  if (parts.done) {
    return (
      <p className="text-2xl font-extrabold text-white">Starting soon…</p>
    )
  }
  const cells = [
    ...(parts.days > 0 ? [{ label: 'Days', value: parts.days }] : []),
    { label: 'Hrs', value: parts.hours },
    { label: 'Min', value: parts.mins },
    { label: 'Sec', value: parts.secs },
  ]
  return (
    <div className="grid grid-cols-4 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="rounded-xl border border-white/10 bg-black/30 px-1 py-2.5"
        >
          <p className="text-xl font-extrabold tabular-nums text-white sm:text-2xl">
            {String(cell.value).padStart(2, '0')}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
            {cell.label}
          </p>
        </div>
      ))}
    </div>
  )
}

export function LiveView({ liveId }: LiveViewProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [live, setLive] = useState<LiveDto | null>(null)
  const [creds, setCreds] = useState<AgoraCreds | null>(null)
  const [price, setPrice] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState<'wallet' | 'razorpay' | null>(null)
  const [notifyMe, setNotifyMe] = useState(false)
  const [notifyBusy, setNotifyBusy] = useState(false)
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
      if (message.toLowerCase().includes('not started')) {
        setPhase('scheduled')
        return
      }
      if (
        message.toLowerCase().includes('preparing') ||
        message.toLowerCase().includes('not public')
      ) {
        setPhase('preparing')
        return
      }
      try {
        const details = await getLive(liveId)
        setLive(details.live)
        setNotifyMe(Boolean(details.notifyMe ?? details.live.notifyMe))
        if (
          details.live.status === 'PRACTICE' ||
          details.live.isPractice
        ) {
          setPhase('preparing')
          return
        }
      } catch {
        // ignore
      }
      setError(message || 'Could not join this live. Please try again.')
      setPhase('error')
    }
  }, [liveId])

  const bootstrap = useCallback(async () => {
    try {
      const details = await getLive(liveId)
      setLive(details.live)
      setNotifyMe(Boolean(details.notifyMe ?? details.live.notifyMe))
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
      if (
        details.live.status === 'PRACTICE' ||
        Boolean(details.live.isPractice)
      ) {
        setPhase('preparing')
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

  useEffect(() => {
    if (phase !== 'scheduled' && phase !== 'preparing') return
    const ticker =
      phase === 'scheduled'
        ? setInterval(() => setTick((t) => t + 1), 1000)
        : null
    const poll = setInterval(async () => {
      try {
        const details = await getLive(liveId)
        if (
          phaseRef.current !== 'scheduled' &&
          phaseRef.current !== 'preparing'
        ) {
          return
        }
        setLive(details.live)
        setNotifyMe(Boolean(details.notifyMe ?? details.live.notifyMe))
        if (
          details.live.status === 'PRACTICE' ||
          details.live.isPractice
        ) {
          if (phaseRef.current !== 'preparing') setPhase('preparing')
          return
        }
        if (details.live.status === 'SCHEDULED') {
          if (phaseRef.current !== 'scheduled') setPhase('scheduled')
          return
        }
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
      if (ticker) clearInterval(ticker)
      clearInterval(poll)
    }
  }, [phase, liveId, attemptJoin])

  async function toggleNotifyMe() {
    if (notifyBusy) return
    setNotifyBusy(true)
    setError(null)
    try {
      if (notifyMe) {
        const res = await unnotifyMeLive(liveId)
        setNotifyMe(Boolean(res.notifyMe))
      } else {
        const res = await notifyMeLive(liveId)
        setNotifyMe(Boolean(res.notifyMe))
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not update reminder'
      )
    } finally {
      setNotifyBusy(false)
    }
  }

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
    setCreds(null)
    setPhase('loading')
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
        initialPaused={Boolean(live.isPaused)}
        initialBrbMessage={live.brbMessage}
        initialBrbImageUrl={live.brbImageUrl}
        initialLatencyMode={
          live.latencyMode === 'NORMAL' ? 'NORMAL' : 'ULTRA_LOW'
        }
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
          ) : phase === 'preparing' ? (
            <Loader2 className="size-6 animate-spin text-white" />
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
                Premiere
              </p>
              <h1 className="mt-1 text-lg font-bold text-white">{live.title}</h1>
              <p className="mt-1 text-[13px] text-white/50">
                {live.creator?.name
                  ? `${live.creator.name} will go live`
                  : 'This creator will go live'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <CountdownBlocks iso={live.scheduledAt} />
              <p className="mt-3 text-[13px] text-white/45">
                {formatPremiereWhen(live.scheduledAt)}
              </p>
            </div>
            <p className="text-[12px] text-white/40">
              {live.accessType === 'PAID'
                ? `Paid live · ₹${live.price ?? 0} — you'll be asked to pay when it starts`
                : 'Free for subscribers'}
            </p>
            <button
              type="button"
              disabled={notifyBusy}
              onClick={() => void toggleNotifyMe()}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition disabled:opacity-50 ${
                notifyMe
                  ? 'border border-white/15 bg-white/10 text-white'
                  : 'bg-white text-[#07070b] hover:bg-white/90'
              }`}
            >
              {notifyBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : notifyMe ? (
                <BellOff className="size-4" />
              ) : (
                <Bell className="size-4" />
              )}
              {notifyMe ? 'Reminded' : 'Notify Me'}
            </button>
            <p className="text-[12px] text-white/35">
              {notifyMe
                ? 'We’ll remind you in-app 1 hour and 15 minutes before go-live.'
                : 'Get in-app reminders 1 hour and 15 minutes before this premiere.'}
            </p>
            <p className="text-[12px] text-white/35">
              Keep this page open — you&apos;ll join automatically when{' '}
              {live.creator?.name ?? 'the creator'} starts.
            </p>
            {error ? <p className="text-[13px] text-rose-400">{error}</p> : null}
            <button
              type="button"
              onClick={leave}
              className="text-[13px] text-white/40 transition hover:text-white/70"
            >
              Go back
            </button>
          </div>
        ) : null}

        {phase === 'preparing' ? (
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-amber-300/80 uppercase">
                Preparing
              </p>
              <h1 className="mt-1 text-lg font-bold text-white">
                {live?.title ?? 'Live'}
              </h1>
              <p className="mt-1 text-[13px] text-white/50">
                Creator is preparing — hang tight until they go public.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[13px] text-white/70">
                This warm-up is private. You&apos;ll be able to join once the
                stream goes live to the audience.
              </p>
            </div>
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
                {live.accessType === 'PAID'
                  ? ' (paid lives billed separately)'
                  : ''}
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
            {error ? <p className="text-[13px] text-rose-400">{error}</p> : null}
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
