'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SubscriptionItem {
  id: string
  status: string
  entitled: boolean
  priceSnapshot: string
  currency: string
  currentPeriodEnd: string
  plan: {
    id: string
    name: string
    price: string
    creatorProfileId: string
    creator?: {
      id: string
      username: string
      displayName: string | null
      avatarUrl: string | null
    }
  }
}

export function UserSubscriptions() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.subscriptionsMe,
    queryFn: async () => {
      const items = await api<SubscriptionItem[]>('/subscriptions/me?limit=100')
      return Array.isArray(items) ? items : []
    },
    staleTime: 60_000,
  })

  const active = (data ?? []).filter(
    (s) => s.entitled || ['ACTIVE', 'TRIALING', 'PAST_DUE'].includes(s.status)
  )

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
          Memberships
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          Subscriptions
        </h1>
        <p className="mt-1 text-[14px] text-white/45">
          Creators you are subscribed to
        </p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-[13px] text-white/40">Loading subscriptions…</p>
        ) : null}
        {isError ? (
          <p className="text-[13px] text-red-300/80">
            Could not load subscriptions. Try again.
          </p>
        ) : null}

        {active.map((sub) => {
          const creator = sub.plan.creator
          const handle = creator?.username?.replace(/^@/, '') ?? ''
          const name = creator?.displayName || handle || 'Creator'
          return (
            <Link
              key={sub.id}
              href={handle ? `/${handle}` : '/user/explore'}
              className={cn(
                'flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-3.5',
                'transition-colors hover:border-white/16 hover:bg-white/[0.05]'
              )}
            >
              <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
                {creator?.avatarUrl ? (
                  <Image
                    src={creator.avatarUrl}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center bg-white/10 text-sm font-bold text-white/70">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-white">
                  {name}
                </span>
                <span className="block truncate text-[12px] text-white/45">
                  {sub.plan.name} · {formatCurrency(Number(sub.plan.price))}
                  /mo
                  {handle ? ` · @${handle}` : ''}
                </span>
              </span>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase',
                  sub.entitled
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/10 bg-white/[0.04] text-white/50'
                )}
              >
                {sub.status}
              </span>
            </Link>
          )
        })}

        {!isLoading && !isError && active.length === 0 ? (
          <p className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-[13px] text-white/40">
            No active subscriptions yet. Subscribe to an AI creator to unlock
            their posts.
          </p>
        ) : null}
      </div>
    </div>
  )
}
