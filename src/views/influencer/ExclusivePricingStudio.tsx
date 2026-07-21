'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Save, Video, Clapperboard } from 'lucide-react'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { api, ApiError } from '@/lib/api'

type Pricing = {
  currency?: string
  imagePrice?: string | number | null
  videoPrice?: string | number | null
  reelPrice?: string | number | null
}

type CreatorProfileResponse = {
  profile?: { pricing?: Pricing }
  pricing?: Pricing
}

export function ExclusivePricingStudio() {
  const queryClient = useQueryClient()
  const [imagePrice, setImagePrice] = useState('')
  const [videoPrice, setVideoPrice] = useState('')
  const [reelPrice, setReelPrice] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pricingQuery = useQuery({
    queryKey: ['creator-exclusive-pricing'],
    queryFn: () => api<CreatorProfileResponse>('/creators/me'),
  })

  useEffect(() => {
    const pricing =
      pricingQuery.data?.profile?.pricing ?? pricingQuery.data?.pricing
    if (!pricing) return
    setImagePrice(String(pricing.imagePrice ?? ''))
    setVideoPrice(String(pricing.videoPrice ?? ''))
    setReelPrice(String(pricing.reelPrice ?? ''))
  }, [pricingQuery.data])

  const saveMutation = useMutation({
    mutationFn: () =>
      api('/creators/me/pricing', {
        method: 'PUT',
        body: JSON.stringify({
          imagePrice: imagePrice ? Number(imagePrice) : null,
          videoPrice: videoPrice ? Number(videoPrice) : null,
          reelPrice: reelPrice ? Number(reelPrice) : null,
        }),
      }),
    onSuccess: async () => {
      setError(null)
      setMessage('Exclusive content pricing saved')
      await queryClient.invalidateQueries({
        queryKey: ['creator-exclusive-pricing'],
      })
      window.setTimeout(() => setMessage(null), 1800)
    },
    onError: (reason) => {
      setMessage(null)
      setError(
        reason instanceof ApiError || reason instanceof Error
          ? reason.message
          : 'Could not save exclusive pricing'
      )
    },
  })

  const fields = [
    {
      label: 'Exclusive image',
      description: 'One-time unlock price for a premium image post.',
      icon: ImageIcon,
      value: imagePrice,
      setValue: setImagePrice,
    },
    {
      label: 'Exclusive video',
      description: 'One-time unlock price for a premium video post.',
      icon: Video,
      value: videoPrice,
      setValue: setVideoPrice,
    },
    {
      label: 'Exclusive reel',
      description: 'One-time unlock price for a premium reel.',
      icon: Clapperboard,
      value: reelPrice,
      setValue: setReelPrice,
    },
  ]

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Exclusive content</h2>
        <p className="mt-1 text-sm text-white/45">
          Set default pay-per-view prices. You can still override the price on
          each post.
        </p>
      </div>

      {message ? (
        <p className="mb-4 text-sm text-emerald-400">{message}</p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-rose-400">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {fields.map((field) => (
          <StudioGlassCard key={field.label} className="p-5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-200">
              <field.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-white">{field.label}</h3>
            <p className="mt-1 min-h-10 text-xs leading-relaxed text-white/40">
              {field.description}
            </p>
            <label className="mt-4 block">
              <span className="mb-2 block text-[11px] font-semibold tracking-wide text-white/40 uppercase">
                Price (INR)
              </span>
              <div className="flex h-11 items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 focus-within:border-fuchsia-400/40">
                <span className="mr-2 text-sm text-white/40">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={field.value}
                  onChange={(event) => field.setValue(event.target.value)}
                  placeholder="0"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                />
              </div>
            </label>
          </StudioGlassCard>
        ))}
      </div>

      <button
        type="button"
        disabled={saveMutation.isPending || pricingQuery.isLoading}
        onClick={() => saveMutation.mutate()}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(217,70,239,0.28)] disabled:opacity-50"
      >
        <Save className="size-4" />
        {saveMutation.isPending ? 'Saving…' : 'Save exclusive pricing'}
      </button>
    </div>
  )
}
