'use client'

import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import {
  Coffee,
  CreditCard,
  Lock,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { StatCard } from '@/components/creator-studio/StatCard'
import { StudioChart } from '@/components/creator-studio/StudioChart'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { api } from '@/lib/api'
import {
  emptyMonthSeries,
  fetchCreatorDashboard,
  fetchMyPosts,
  mapApiPostToStudio,
  parseMoney,
} from '@/lib/studio-api'
import { formatCurrency } from '@/lib/utils'

type AnalyticsPayload = {
  analytics?: {
    revenue?: string
    coffeeRevenue?: string
    ppvRevenue?: string
    subscriptionRevenue?: string
  } | null
}

export function EarningsStudio() {
  const prefersReducedMotion = useReducedMotion()

  const dashboardQuery = useQuery({
    queryKey: ['creator-dashboard'],
    queryFn: fetchCreatorDashboard,
  })

  const analyticsQuery = useQuery({
    queryKey: ['creator-analytics'],
    queryFn: () => api<AnalyticsPayload>('/creators/me/analytics'),
  })

  const postsQuery = useQuery({
    queryKey: ['creator-posts-revenue'],
    queryFn: async () => {
      const posts = await fetchMyPosts({ limit: 50, status: 'PUBLISHED' })
      return (Array.isArray(posts) ? posts : []).map(mapApiPostToStudio)
    },
  })

  const analytics =
    analyticsQuery.data?.analytics ??
    dashboardQuery.data?.profile.analytics ??
    null

  const total = parseMoney(analytics?.revenue)
  const coffee = parseMoney(analytics?.coffeeRevenue)
  const ppv = parseMoney(analytics?.ppvRevenue)
  const subscriptions = parseMoney(analytics?.subscriptionRevenue)

  const paidPosts = (postsQuery.data ?? [])
    .filter((p) => (p.price ?? 0) > 0)
    .sort((a, b) => (b.price ?? 0) * b.views - (a.price ?? 0) * a.views)
    .slice(0, 5)

  const maxPostRevenue = Math.max(
    ...paidPosts.map((p) => (p.price ?? 0) * Math.max(p.views, 1)),
    1
  )

  const loading =
    dashboardQuery.isLoading ||
    analyticsQuery.isLoading ||
    postsQuery.isLoading

  return (
    <div>
      <StudioPageHeader
        title="Revenue"
        description="Subscriptions, locked posts, and coffee tips from your live earnings summary. Cash-out payouts come in a later release."
        actions={
          <button
            type="button"
            disabled
            title="Payouts are not available yet"
            className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-full bg-white/10 px-5 text-[13px] font-semibold text-white/45"
          >
            <Wallet className="size-4" />
            Request payout
          </button>
        }
      />

      {loading ? (
        <p className="mb-6 text-sm text-white/45">Loading revenue…</p>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(total)}
          icon={Sparkles}
        />
        <StatCard
          label="Subscriptions"
          value={formatCurrency(subscriptions)}
          icon={CreditCard}
          delay={0.04}
        />
        <StatCard
          label="Locked Post Sales"
          value={formatCurrency(ppv)}
          icon={Lock}
          delay={0.08}
        />
        <StatCard
          label="Coffee Donations"
          value={formatCurrency(coffee)}
          icon={Coffee}
          delay={0.12}
        />
        <StatCard
          label="Available balance"
          value={formatCurrency(total)}
          icon={Wallet}
          delay={0.16}
        />
        <StatCard
          label="Payouts"
          value="Coming soon"
          icon={Wallet}
          delay={0.2}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StudioChart
            title="Revenue over time"
            subtitle="History appears once analytics aggregation is enabled"
            badge="INR"
            data={emptyMonthSeries()}
            formatValue={(v) => formatCurrency(v)}
          />
        </div>

        <StudioGlassCard glow="creator" className="p-5 lg:col-span-2">
          <p className="text-[12px] font-medium tracking-[0.1em] text-white/40 uppercase">
            Breakdown
          </p>
          <div className="mt-4 space-y-3 text-[13px]">
            <div className="flex justify-between text-white/55">
              <span>Subscriptions</span>
              <span className="font-medium text-white">
                {formatCurrency(subscriptions)}
              </span>
            </div>
            <div className="flex justify-between text-white/55">
              <span>PPV / locked posts</span>
              <span className="font-medium text-white">
                {formatCurrency(ppv)}
              </span>
            </div>
            <div className="flex justify-between text-white/55">
              <span>Coffee tips</span>
              <span className="font-medium text-white">
                {formatCurrency(coffee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/8 pt-3 text-white/80">
              <span>Total</span>
              <span className="font-semibold text-white">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
          <p className="mt-5 text-[12px] text-white/40">
            Withdrawal / bank payout APIs are out of scope for this release.
          </p>
        </StudioGlassCard>
      </div>

      <StudioGlassCard glow="creator" className="p-5 sm:p-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium tracking-[0.1em] text-white/40 uppercase">
              Performance
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">
              Top paid posts
            </h3>
          </div>
          <span className="text-[12px] text-white/35">By price × views</span>
        </div>
        {paidPosts.length === 0 ? (
          <p className="text-sm text-white/45">
            No PPV posts yet. Publish a pay-per-view post to track sales here.
          </p>
        ) : (
          <div className="space-y-3">
            {paidPosts.map((post, index) => {
              const estimate = (post.price ?? 0) * Math.max(post.views, 1)
              return (
                <motion.div
                  key={post.id}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={post.thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {post.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/40 capitalize">
                        {post.type} · {formatCurrency(post.price ?? 0)}
                      </p>
                    </div>
                    <p className="shrink-0 text-[13px] font-semibold text-emerald-300">
                      ~{formatCurrency(estimate)}
                    </p>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                      initial={
                        prefersReducedMotion
                          ? {
                              width: `${(estimate / maxPostRevenue) * 100}%`,
                            }
                          : { width: 0 }
                      }
                      animate={{
                        width: `${(estimate / maxPostRevenue) * 100}%`,
                      }}
                      transition={{
                        duration: 0.7,
                        delay: 0.1 + index * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </StudioGlassCard>
    </div>
  )
}
