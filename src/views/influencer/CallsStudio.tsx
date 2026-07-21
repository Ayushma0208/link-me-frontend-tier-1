'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Phone, PhoneCall, Video } from 'lucide-react'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { api, ApiError } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

type CreatorProfile = {
  pricing?: {
    currency?: string
    voiceCallPrice?: string | number | null
    videoCallPrice?: string | number | null
  }
}

type Availability = {
  isAcceptingCalls: boolean
}

type CallSession = {
  id: string
  callerId: string
  calleeId: string
  callerName?: string | null
  callerUsername?: string | null
  calleeName?: string | null
  calleeUsername?: string | null
  type: 'VOICE' | 'VIDEO'
  status: string
  pricePerMinute: string | number
  currency: string
  durationSeconds: number
  totalAmount: string | number
  createdAt: string
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export function CallsStudio() {
  const queryClient = useQueryClient()
  const username = useAuthStore((state) => state.user?.username)
  const [available, setAvailable] = useState(false)
  const [voicePrice, setVoicePrice] = useState('')
  const [videoPrice, setVideoPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const profileQuery = useQuery({
    queryKey: ['creator-call-settings'],
    queryFn: () =>
      api<{ profile?: CreatorProfile } & CreatorProfile>('/creators/me'),
  })

  const availabilityQuery = useQuery({
    queryKey: ['creator-call-availability', username],
    enabled: Boolean(username),
    queryFn: () =>
      api<{ availability: Availability }>(
        `/calls/creators/${encodeURIComponent(username!)}/availability`
      ),
  })

  useEffect(() => {
    if (!profileQuery.data) return
    const profile = profileQuery.data.profile ?? profileQuery.data
    setVoicePrice(String(profile.pricing?.voiceCallPrice ?? ''))
    setVideoPrice(String(profile.pricing?.videoCallPrice ?? ''))
  }, [profileQuery.data])

  useEffect(() => {
    if (availabilityQuery.data) {
      setAvailable(availabilityQuery.data.availability.isAcceptingCalls)
    }
  }, [availabilityQuery.data])

  const callsQuery = useQuery({
    queryKey: ['creator-call-history'],
    queryFn: async () => {
      const response = await api<
        CallSession[] | { items?: CallSession[] }
      >('/calls/sessions/me?page=1&limit=50')
      return Array.isArray(response) ? response : response.items ?? []
    },
    refetchInterval: 10_000,
  })

  const availabilityMutation = useMutation({
    mutationFn: (isAcceptingCalls: boolean) =>
      api('/calls/availability', {
        method: 'PUT',
        body: JSON.stringify({ isAcceptingCalls }),
      }),
    onSuccess: (_, next) => {
      setAvailable(next)
      setError(null)
      void queryClient.invalidateQueries({
        queryKey: ['creator-call-availability', username],
      })
    },
    onError: showError,
  })

  const pricingMutation = useMutation({
    mutationFn: () =>
      api('/creators/me/pricing', {
        method: 'PUT',
        body: JSON.stringify({
          voiceCallPrice: Number(voicePrice),
          videoCallPrice: Number(videoPrice),
        }),
      }),
    onSuccess: () => {
      setSaved(true)
      setError(null)
      window.setTimeout(() => setSaved(false), 1800)
      void queryClient.invalidateQueries({ queryKey: ['creator-call-settings'] })
    },
    onError: showError,
  })

  function showError(reason: unknown) {
    setError(
      reason instanceof ApiError || reason instanceof Error
        ? reason.message
        : 'Could not save call settings'
    )
  }

  const calls = callsQuery.data ?? []
  const currency =
    (profileQuery.data?.profile ?? profileQuery.data)?.pricing?.currency ?? 'INR'

  return (
    <div>
      <StudioPageHeader
        title="Calls"
        description="Control incoming voice and video calls, set your rates, and review call history."
      />

      <div className="mb-7 grid gap-4 lg:grid-cols-2">
        <StudioGlassCard glow="creator" className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white">Incoming calls</h2>
              <p className="mt-1 text-sm text-white/40">
                IncomingCallHost will alert you globally while this is enabled.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              disabled={availabilityMutation.isPending}
              onClick={() => availabilityMutation.mutate(!available)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                available ? 'bg-emerald-500' : 'bg-white/15'
              }`}
            >
              <span
                className={`absolute top-1 size-5 rounded-full bg-white transition ${
                  available ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
          <div
            className={`mt-5 rounded-2xl border p-4 ${
              available
                ? 'border-emerald-400/20 bg-emerald-500/10'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <p className="text-sm font-semibold text-white">
              {available ? 'Available for calls' : 'Calls are paused'}
            </p>
            <p className="mt-1 text-xs text-white/45">
              {available
                ? 'Fans can ring you at the rates configured here.'
                : 'Fans will see that you are unavailable.'}
            </p>
          </div>
        </StudioGlassCard>

        <StudioGlassCard className="p-5 sm:p-6">
          <h2 className="font-semibold text-white">Per-minute pricing</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/50">
                <Phone className="size-3.5" /> Voice
              </span>
              <input
                type="number"
                min="0"
                value={voicePrice}
                onChange={(event) => setVoicePrice(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-fuchsia-400/35"
              />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/50">
                <Video className="size-3.5" /> Video
              </span>
              <input
                type="number"
                min="0"
                value={videoPrice}
                onChange={(event) => setVideoPrice(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-fuchsia-400/35"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={
              pricingMutation.isPending ||
              Number(voicePrice) < 0 ||
              Number(videoPrice) < 0
            }
            onClick={() => pricingMutation.mutate()}
            className="mt-4 h-10 rounded-full bg-white px-5 text-xs font-semibold text-black disabled:opacity-40"
          >
            {pricingMutation.isPending
              ? 'Saving…'
              : saved
                ? 'Saved'
                : 'Save prices'}
          </button>
        </StudioGlassCard>
      </div>

      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      <h2 className="mb-3 text-lg font-semibold text-white">Call history</h2>
      <div className="overflow-hidden rounded-[22px] border border-white/10">
        {calls.map((call) => {
          const caller = call.callerName || call.callerUsername || 'Fan'
          return (
            <div
              key={call.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-white/7 bg-white/[0.025] px-4 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-fuchsia-200">
                  {call.type === 'VIDEO' ? (
                    <Video className="size-4" />
                  ) : (
                    <PhoneCall className="size-4" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{caller}</p>
                  <p className="text-xs text-white/40">
                    {new Date(call.createdAt).toLocaleString()} ·{' '}
                    {formatDuration(call.durationSeconds || 0)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  {formatCurrency(Number(call.totalAmount || 0), currency)}
                </p>
                <p className="text-[11px] text-white/40">
                  {call.status} ·{' '}
                  {formatCurrency(Number(call.pricePerMinute || 0), currency)}/min
                </p>
              </div>
            </div>
          )
        })}
        {callsQuery.isLoading ? (
          <p className="bg-white/[0.025] p-5 text-sm text-white/40">
            Loading calls…
          </p>
        ) : null}
        {!callsQuery.isLoading && calls.length === 0 ? (
          <p className="bg-white/[0.025] p-10 text-center text-sm text-white/40">
            No calls yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}
