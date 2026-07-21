'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Coffee, ExternalLink, Wallet } from 'lucide-react'

import { StatCard } from '@/components/creator-studio/StatCard'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { api, ApiError } from '@/lib/api'
import {
  fetchCreatorDashboard,
  parseMoney,
} from '@/lib/studio-api'
import { cn, formatCurrency } from '@/lib/utils'

export function CoffeeStudio() {
  const queryClient = useQueryClient()
  const dashboardQuery = useQuery({
    queryKey: ['creator-dashboard'],
    queryFn: fetchCreatorDashboard,
  })

  const profile = dashboardQuery.data?.profile
  const username = profile?.user.username || 'creator'
  const coffeeRevenue = parseMoney(profile?.analytics?.coffeeRevenue)

  const [enabled, setEnabled] = useState(true)
  const [buttonText, setButtonText] = useState('Buy me a coffee')
  const [thankYou, setThankYou] = useState('Thank you for the support!')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setEnabled(profile.coffee.enabled)
    setButtonText(profile.coffee.buttonText || 'Buy me a coffee')
    setThankYou(
      profile.coffee.thankYouMessage || 'Thank you for the support!'
    )
  }, [profile])

  const saveMutation = useMutation({
    mutationFn: () =>
      api('/creators/me/coffee', {
        method: 'PUT',
        body: JSON.stringify({
          isCoffeeEnabled: enabled,
          coffeeButtonText: buttonText.trim() || 'Buy me a coffee',
          coffeeThankYouMsg: thankYou.trim() || null,
        }),
      }),
    onSuccess: async () => {
      setError(null)
      setMessage('Coffee settings saved')
      await queryClient.invalidateQueries({ queryKey: ['creator-dashboard'] })
      window.setTimeout(() => setMessage(null), 2000)
    },
    onError: (e) => {
      setMessage(null)
      setError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : 'Failed to save coffee settings'
      )
    },
  })

  const previewHref = `/@${username}/coffee`

  return (
    <div>
      <StudioPageHeader
        title="Buy Me a Coffee"
        description="Enable tips, customize your tip jar, and preview the public coffee page."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.1]"
            >
              <ExternalLink className="size-4" />
              Preview page
            </Link>
            <button
              type="button"
              disabled={saveMutation.isPending || dashboardQuery.isLoading}
              onClick={() => saveMutation.mutate()}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 px-5 text-[13px] font-semibold text-white shadow-[0_12px_32px_rgba(245,158,11,0.3)] disabled:opacity-60"
            >
              <Coffee className="size-4" />
              {saveMutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        }
      />

      {dashboardQuery.isLoading ? (
        <p className="mb-6 text-sm text-white/45">Loading coffee settings…</p>
      ) : null}
      {message ? (
        <p className="mb-4 text-sm text-emerald-400">{message}</p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-rose-400">{error}</p> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Coffee revenue"
          value={formatCurrency(coffeeRevenue)}
          icon={Wallet}
        />
        <StatCard
          label="Status"
          value={enabled ? 'Enabled' : 'Disabled'}
          icon={Coffee}
        />
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-white">
            Donations {enabled ? 'enabled' : 'disabled'}
          </p>
          <p className="text-[12px] text-white/45">
            Fans can tip you from your public coffee page when enabled.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            'relative h-10 w-14 shrink-0 rounded-full transition-colors',
            enabled
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500'
              : 'bg-white/15'
          )}
        >
          <span
            className={cn(
              'absolute top-1.5 size-7 rounded-full bg-white shadow transition-transform',
              enabled ? 'left-[26px]' : 'left-1.5'
            )}
          />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudioGlassCard className="space-y-4 p-5">
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
              Button text
            </span>
            <input
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value.slice(0, 80))}
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-[13px] text-white outline-none focus:border-amber-400/35"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
              Thank-you message
            </span>
            <textarea
              value={thankYou}
              onChange={(e) => setThankYou(e.target.value.slice(0, 500))}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-[13px] text-white outline-none focus:border-amber-400/35"
            />
          </label>
        </StudioGlassCard>

        <StudioGlassCard className="p-5">
          <p className="text-[12px] font-medium tracking-[0.1em] text-white/40 uppercase">
            Preview
          </p>
          <div className="mt-4 rounded-[24px] border border-amber-400/20 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent p-6">
            <p className="text-sm text-white/55">@{username}</p>
            <p className="mt-2 text-2xl font-bold text-white">{buttonText}</p>
            <p className="mt-3 text-sm text-white/60">{thankYou}</p>
            <button
              type="button"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 px-5 text-[13px] font-semibold text-white"
            >
              <Coffee className="size-4" />
              {buttonText}
            </button>
          </div>
        </StudioGlassCard>
      </div>
    </div>
  )
}
