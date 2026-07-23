'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, Clapperboard, Play, Radio, Square } from 'lucide-react'

import { LiveRoom } from '@/components/live/LiveRoom'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { api, ApiError } from '@/lib/api'
import {
  enterPracticeMine,
  goPublicLive,
  startPracticeMine,
  type AgoraCreds,
  type LiveDto,
  type StreamQualityPolicy,
} from '@/lib/live'
import { formatCurrency } from '@/lib/utils'

type LiveResponse = {
  live: LiveDto
  agora?: AgoraCreds
  streamQuality?: StreamQualityPolicy
  notified?: number
}

function unwrapLives(response: LiveDto[] | { items?: LiveDto[]; lives?: LiveDto[] }) {
  if (Array.isArray(response)) return response
  return response.items ?? response.lives ?? []
}

export function LiveEventsStudio() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [accessType, setAccessType] = useState<'FREE' | 'PAID'>('FREE')
  const [price, setPrice] = useState('99')
  const [emojiPrice, setEmojiPrice] = useState('10')
  const [scheduledAt, setScheduledAt] = useState('')
  const [room, setRoom] = useState<{
    live: LiveDto
    agora: AgoraCreds
    streamQuality?: StreamQualityPolicy
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const livesQuery = useQuery({
    queryKey: ['creator-lives'],
    queryFn: async () =>
      unwrapLives(
        await api<LiveDto[] | { items?: LiveDto[]; lives?: LiveDto[] }>(
          '/creators/me/live'
        )
      ),
    refetchInterval: 10_000,
  })

  const input = {
    title: title.trim(),
    description: description.trim() || null,
    accessType,
    ...(accessType === 'PAID' ? { price: Number(price) } : {}),
    emojiPrice: Number(emojiPrice),
  }

  const createLive = useMutation({
    mutationFn: () =>
      api<LiveResponse>('/creators/me/live', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (result) => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['creator-lives'] })
      if (result.agora)
        setRoom({
          live: result.live,
          agora: result.agora,
          streamQuality: result.streamQuality,
        })
    },
    onError: handleError,
  })

  const practiceLive = useMutation({
    mutationFn: () => startPracticeMine(input),
    onSuccess: (result) => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['creator-lives'] })
      if (result.agora)
        setRoom({
          live: result.live,
          agora: result.agora,
          streamQuality: result.streamQuality,
        })
    },
    onError: handleError,
  })

  const scheduleLive = useMutation({
    mutationFn: () =>
      api<LiveResponse>('/creators/me/live/schedule', {
        method: 'POST',
        body: JSON.stringify({
          ...input,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      }),
    onSuccess: () => {
      setError(null)
      setTitle('')
      setDescription('')
      setScheduledAt('')
      void queryClient.invalidateQueries({ queryKey: ['creator-lives'] })
    },
    onError: handleError,
  })

  const startScheduled = useMutation({
    mutationFn: (id: string) =>
      api<LiveResponse>(`/creators/me/live/${id}/start`, { method: 'POST' }),
    onSuccess: (result) => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['creator-lives'] })
      if (result.agora)
        setRoom({
          live: result.live,
          agora: result.agora,
          streamQuality: result.streamQuality,
        })
    },
    onError: handleError,
  })

  const practiceScheduled = useMutation({
    mutationFn: (id: string) => enterPracticeMine(id),
    onSuccess: (result) => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['creator-lives'] })
      if (result.agora)
        setRoom({
          live: result.live,
          agora: result.agora,
          streamQuality: result.streamQuality,
        })
    },
    onError: handleError,
  })

  const endLive = useMutation({
    mutationFn: (id: string) =>
      api<LiveResponse>(`/creators/me/live/${id}/end`, { method: 'POST' }),
    onSuccess: () => {
      setRoom(null)
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['creator-lives'] })
    },
    onError: handleError,
  })

  const goPublic = useMutation({
    mutationFn: (id: string) => goPublicLive(id),
    onSuccess: (result) => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['creator-lives'] })
      // Keep existing Agora creds — same channel; replacing them remounts
      // LiveRoom and kills the host camera.
      setRoom((prev) => (prev ? { ...prev, live: result.live } : prev))
    },
    onError: handleError,
  })

  function handleError(reason: unknown) {
    setError(
      reason instanceof ApiError || reason instanceof Error
        ? reason.message
        : 'Something went wrong'
    )
  }

  if (room) {
    const practicing =
      Boolean(room.live.isPractice) || room.live.status === 'PRACTICE'
    return (
      <LiveRoom
        creds={room.agora}
        title={room.live.title}
        subtitle={
          practicing
            ? room.live.scheduledAt
              ? 'Practice for your premiere — fans can’t join yet'
              : 'Practice mode — not visible to fans'
            : 'Broadcasting as host'
        }
        liveId={room.live.id}
        emojiPrice={room.live.emojiPrice}
        initialPaused={Boolean(room.live.isPaused)}
        initialBrbMessage={room.live.brbMessage}
        initialBrbImageUrl={room.live.brbImageUrl}
        initialLatencyMode={
          room.live.latencyMode === 'NORMAL' ? 'NORMAL' : 'ULTRA_LOW'
        }
        streamQuality={room.streamQuality}
        isPractice={practicing}
        onLeave={() => setRoom(null)}
        onEnd={() => endLive.mutate(room.live.id)}
        onGoPublic={
          practicing
            ? async () => {
                const res = await goPublic.mutateAsync(room.live.id)
                return { live: res.live }
              }
            : undefined
        }
      />
    )
  }

  const lives = livesQuery.data ?? []
  const pending =
    createLive.isPending || scheduleLive.isPending || practiceLive.isPending
  const valid =
    title.trim() &&
    Number(emojiPrice) > 0 &&
    (accessType === 'FREE' || Number(price) > 0)

  return (
    <div>
      <StudioPageHeader
        title="Live Events"
        description="Practice privately, go live now, or schedule a paid or free broadcast."
      />

      <StudioGlassCard glow="creator" className="mb-6 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold text-white/50">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Friday night Q&A"
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-fuchsia-400/40"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold text-white/50">
              Schedule time
            </span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none [color-scheme:dark] focus:border-fuchsia-400/40"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-semibold text-white/50">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Tell fans what you’ll cover…"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400/40"
            />
          </label>
          <div className="flex gap-2">
            {(['FREE', 'PAID'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccessType(type)}
                className={`h-11 flex-1 rounded-2xl border text-sm font-semibold ${
                  accessType === type
                    ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-white'
                    : 'border-white/10 text-white/45'
                }`}
              >
                {type === 'FREE' ? 'Free' : 'Paid'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-xs font-semibold text-white/50">
                Entry price
              </span>
              <input
                type="number"
                min="1"
                disabled={accessType === 'FREE'}
                value={accessType === 'FREE' ? '0' : price}
                onChange={(event) => setPrice(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white disabled:opacity-40"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold text-white/50">
                Emoji price
              </span>
              <input
                type="number"
                min="1"
                value={emojiPrice}
                onChange={(event) => setEmojiPrice(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white"
              />
            </label>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!valid || pending}
            onClick={() => createLive.mutate()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Radio className="size-4" />
            Go live now
          </button>
          <button
            type="button"
            disabled={!valid || pending}
            onClick={() => practiceLive.mutate()}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-5 text-sm font-semibold text-amber-100 disabled:opacity-40"
          >
            <Clapperboard className="size-4" />
            Practice
          </button>
          <button
            type="button"
            disabled={!valid || !scheduledAt || pending}
            onClick={() => scheduleLive.mutate()}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <CalendarClock className="size-4" />
            Schedule live
          </button>
        </div>
      </StudioGlassCard>

      <h2 className="mb-3 text-lg font-semibold text-white">Your broadcasts</h2>
      <div className="grid gap-3">
        {lives.map((live) => (
          <StudioGlassCard key={live.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {live.title}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/55">
                    {live.isPaused
                      ? 'BRB'
                      : live.isPractice || live.status === 'PRACTICE'
                        ? 'PRACTICE'
                        : live.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {live.scheduledAt
                    ? new Date(live.scheduledAt).toLocaleString()
                    : live.startedAt
                      ? `Started ${new Date(live.startedAt).toLocaleString()}`
                      : 'Created recently'}
                  {' · '}
                  {live.accessType === 'PAID'
                    ? formatCurrency(Number(live.price ?? 0))
                    : 'Free'}
                  {' · '}Emoji {formatCurrency(Number(live.emojiPrice ?? 0))}
                </p>
              </div>
              {live.status === 'SCHEDULED' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => practiceScheduled.mutate(live.id)}
                    disabled={
                      practiceScheduled.isPending || startScheduled.isPending
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 text-xs font-semibold text-amber-100"
                  >
                    <Clapperboard className="size-3.5" /> Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => startScheduled.mutate(live.id)}
                    disabled={
                      startScheduled.isPending || practiceScheduled.isPending
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-black"
                  >
                    <Play className="size-3.5" /> Start
                  </button>
                </div>
              ) : live.status === 'LIVE' ||
                live.status === 'PRACTICE' ||
                live.isPractice ? (
                <button
                  type="button"
                  onClick={() => endLive.mutate(live.id)}
                  disabled={endLive.isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 text-xs font-semibold text-rose-200"
                >
                  <Square className="size-3.5" />{' '}
                  {live.isPractice || live.status === 'PRACTICE'
                    ? 'End practice'
                    : 'End'}
                </button>
              ) : null}
            </div>
          </StudioGlassCard>
        ))}
        {livesQuery.isLoading ? (
          <p className="text-sm text-white/40">Loading broadcasts…</p>
        ) : null}
        {!livesQuery.isLoading && lives.length === 0 ? (
          <StudioGlassCard className="p-10 text-center text-sm text-white/40">
            No broadcasts yet. Create your first live above.
          </StudioGlassCard>
        ) : null}
      </div>
    </div>
  )
}
