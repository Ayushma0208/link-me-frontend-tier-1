'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { Download, Search, UserMinus, UserCheck, Users } from 'lucide-react'

import { StatCard } from '@/components/creator-studio/StatCard'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { api } from '@/lib/api'
import { cn, formatCurrency, formatFollowers } from '@/lib/utils'

type ApiSubscriber = {
  id: string
  status: string
  currentPeriodEnd?: string | null
  priceSnapshot?: string | number | null
  currency?: string
  plan?: { name?: string | null; interval?: string | null } | null
  user?: {
    displayName?: string | null
    username?: string | null
    avatarUrl?: string | null
  } | null
}

type FilterId = 'all' | 'active' | 'cancelled'

function unwrapSubscribers(
  response: ApiSubscriber[] | { items?: ApiSubscriber[] }
) {
  if (Array.isArray(response)) return response
  return response.items ?? []
}

function exportCsv(rows: ApiSubscriber[]) {
  const header = ['Name', 'Handle', 'Plan', 'Renewal', 'Amount', 'Status']
  const lines = rows.map((r) =>
    [
      r.user?.displayName ?? '',
      r.user?.username ? `@${r.user.username}` : '',
      r.plan?.name ?? r.plan?.interval ?? '',
      r.currentPeriodEnd?.slice(0, 10) ?? '',
      r.priceSnapshot ?? '',
      r.status,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(',')
  )
  const blob = new Blob([[header.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function SubscribersStudio() {
  const prefersReducedMotion = useReducedMotion()
  const [filter, setFilter] = useState<FilterId>('all')
  const [query, setQuery] = useState('')

  const subscribersQuery = useQuery({
    queryKey: ['creator-subscribers'],
    queryFn: async () =>
      unwrapSubscribers(
        await api<ApiSubscriber[] | { items?: ApiSubscriber[] }>(
          '/subscriptions/creators/me/subscribers?limit=100'
        )
      ),
  })

  const rows = subscribersQuery.data ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
      const status = row.status.toUpperCase()
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'cancelled'
            ? status === 'CANCELLED' || status === 'EXPIRED'
            : status === 'ACTIVE'
      if (!matchesFilter) return false
      if (!q) return true
      return (
        (row.user?.displayName ?? '').toLowerCase().includes(q) ||
        (row.user?.username ?? '').toLowerCase().includes(q) ||
        (row.plan?.name ?? '').toLowerCase().includes(q)
      )
    })
  }, [filter, query, rows])

  const activeCount = rows.filter((r) => r.status.toUpperCase() === 'ACTIVE')
    .length
  const cancelledCount = rows.filter((r) => {
    const s = r.status.toUpperCase()
    return s === 'CANCELLED' || s === 'EXPIRED'
  }).length

  return (
    <div>
      <StudioPageHeader
        title="Subscribers"
        description="Track memberships and renewals from fans on your plans."
        actions={
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.1]"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total"
          value={formatFollowers(rows.length)}
          icon={Users}
        />
        <StatCard
          label="Active"
          value={formatFollowers(activeCount)}
          icon={UserCheck}
        />
        <StatCard
          label="Cancelled"
          value={formatFollowers(cancelledCount)}
          icon={UserMinus}
        />
      </div>

      <StudioGlassCard className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or @handle…"
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] pr-3 pl-10 text-[13px] text-white outline-none focus:border-fuchsia-400/35"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['active', 'Active'],
              ['cancelled', 'Cancelled'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[12px] font-medium',
                filter === id
                  ? 'bg-fuchsia-500/20 text-fuchsia-100 ring-1 ring-fuchsia-400/30'
                  : 'bg-white/[0.04] text-white/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </StudioGlassCard>

      {subscribersQuery.isLoading ? (
        <p className="text-sm text-white/45">Loading subscribers…</p>
      ) : filtered.length === 0 ? (
        <StudioGlassCard className="p-10 text-center text-sm text-white/45">
          No subscribers yet. Share your public profile and subscription plans.
        </StudioGlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((row, index) => (
            <motion.div
              key={row.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <StudioGlassCard className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {row.user?.displayName || row.user?.username || 'Fan'}
                  </p>
                  <p className="text-xs text-white/45">
                    {row.user?.username ? `@${row.user.username}` : '—'}
                  </p>
                </div>
                <div className="text-right text-xs text-white/55">
                  <p className="font-medium text-white/80">
                    {row.plan?.name || row.plan?.interval || 'Plan'}
                  </p>
                  <p>
                    {row.priceSnapshot != null
                      ? formatCurrency(Number(row.priceSnapshot))
                      : '—'}{' '}
                    · {row.status}
                  </p>
                  <p>
                    Renews{' '}
                    {row.currentPeriodEnd
                      ? row.currentPeriodEnd.slice(0, 10)
                      : '—'}
                  </p>
                </div>
              </StudioGlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
