'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import {
  Coffee,
  Eye,
  Globe,
  Radio,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { StatCard } from '@/components/creator-studio/StatCard'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioLineChart } from '@/components/creator-studio/StudioLineChart'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import {
  emptyWeekSeries,
  fetchCreatorDashboard,
  fetchMyPosts,
  mapApiPostToStudio,
  parseCount,
  parseMoney,
} from '@/lib/studio-api'
import { api } from '@/lib/api'
import { cn, formatCurrency, formatFollowers } from '@/lib/utils'

type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly'

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

const PERIOD_SUBTITLE: Record<AnalyticsPeriod, string> = {
  daily: 'Latest summary',
  weekly: 'Latest summary',
  monthly: 'Latest summary',
}

type AnalyticsPayload = {
  stats?: {
    followerCount?: number
    subscriberCount?: number
    postCount?: number
  }
  analytics?: {
    views?: string
    reach?: string
    profileVisits?: string
    followersGained?: number
    newSubscribers?: number
    revenue?: string
    coffeeRevenue?: string
    ppvRevenue?: string
    subscriptionRevenue?: string
    engagementRate?: string
  } | null
}

export function AnalyticsStudio() {
  const prefersReducedMotion = useReducedMotion()
  const [period, setPeriod] = useState<AnalyticsPeriod>('weekly')

  const dashboardQuery = useQuery({
    queryKey: ['creator-dashboard'],
    queryFn: fetchCreatorDashboard,
  })

  const analyticsQuery = useQuery({
    queryKey: ['creator-analytics'],
    queryFn: () => api<AnalyticsPayload>('/creators/me/analytics'),
  })

  const postsQuery = useQuery({
    queryKey: ['creator-posts-analytics'],
    queryFn: async () => {
      const posts = await fetchMyPosts({ limit: 50, status: 'PUBLISHED' })
      return (Array.isArray(posts) ? posts : []).map(mapApiPostToStudio)
    },
  })

  const profile = dashboardQuery.data?.profile
  const analytics =
    analyticsQuery.data?.analytics ?? profile?.analytics ?? null
  const stats = analyticsQuery.data?.stats

  const views = parseCount(analytics?.views)
  const reach = parseCount(analytics?.reach)
  const profileVisits = parseCount(analytics?.profileVisits)
  const revenue = parseMoney(analytics?.revenue)
  const coffee = parseMoney(analytics?.coffeeRevenue)

  const followers =
    stats?.followerCount ?? profile?.followerCount ?? 0
  const subscribers =
    stats?.subscriberCount ?? profile?.subscriberCount ?? 0

  const topPosts = useMemo(() => {
    const posts = [...(postsQuery.data ?? [])]
    posts.sort((a, b) => b.views - a.views)
    return posts.slice(0, 5)
  }, [postsQuery.data])

  const maxPostViews = Math.max(...topPosts.map((p) => p.views), 1)

  const seriesPoints = emptyWeekSeries()
  const chartSeries = useMemo(
    () => [
      {
        key: 'views',
        label: 'Views',
        color: '#e879f9',
        values: seriesPoints.map(() => 0),
      },
      {
        key: 'reach',
        label: 'Reach',
        color: '#38bdf8',
        values: seriesPoints.map(() => 0),
      },
    ],
    [seriesPoints]
  )

  const metrics = [
    {
      label: 'Views',
      value: formatFollowers(views),
      icon: Eye,
    },
    {
      label: 'Reach',
      value: formatFollowers(reach),
      icon: Radio,
    },
    {
      label: 'Profile Visits',
      value: formatFollowers(profileVisits),
      icon: Globe,
    },
    {
      label: 'Followers',
      value: formatFollowers(followers),
      icon: Users,
    },
    {
      label: 'Subscribers',
      value: formatFollowers(subscribers),
      icon: UserCheck,
    },
    {
      label: 'Revenue',
      value: formatCurrency(revenue),
      icon: Wallet,
    },
    {
      label: 'Coffee Donations',
      value: formatCurrency(coffee),
      icon: Coffee,
    },
  ]

  const loading =
    dashboardQuery.isLoading || analyticsQuery.isLoading || postsQuery.isLoading

  return (
    <div>
      <StudioPageHeader
        title="Analytics"
        description="Views, reach, audience, and revenue from your live creator profile."
      />

      {loading ? (
        <p className="mb-6 text-sm text-white/45">Loading analytics…</p>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            delay={index * 0.04}
          />
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Performance</h2>
          <p className="text-[13px] text-white/45">
            Time-series charts populate as analytics jobs accumulate history.
          </p>
        </div>
        <div
          className="flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-1"
          role="tablist"
          aria-label="Chart period"
        >
          {PERIODS.map((item) => {
            const active = period === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(item.id)}
                className={cn(
                  'relative shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold transition sm:text-[13px]',
                  active ? 'text-white' : 'text-white/45 hover:text-white/70'
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="analytics-period"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/90 via-fuchsia-500/90 to-pink-500/90"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <StudioLineChart
        key={period}
        title="Views & reach"
        subtitle={PERIOD_SUBTITLE[period]}
        badge={period === 'daily' ? '7d' : period === 'weekly' ? '6w' : '7mo'}
        labels={seriesPoints.map((p) => p.label)}
        series={chartSeries}
        formatValue={(v) => formatFollowers(v)}
        className="mb-6"
      />

      <StudioGlassCard glow="creator" className="p-5 sm:p-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium tracking-[0.1em] text-white/40 uppercase">
              Content
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">
              Top performing posts
            </h3>
          </div>
        </div>
        {topPosts.length === 0 ? (
          <p className="text-sm text-white/45">
            Publish posts or reels to see performance here.
          </p>
        ) : (
          <div className="space-y-3">
            {topPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
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
                    <p className="mt-0.5 text-[11px] capitalize text-white/40">
                      {post.type} · {post.likes} likes
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] font-semibold text-white">
                    {formatFollowers(post.views)}
                  </p>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-400"
                    initial={
                      prefersReducedMotion
                        ? { width: `${(post.views / maxPostViews) * 100}%` }
                        : { width: 0 }
                    }
                    animate={{
                      width: `${(post.views / maxPostViews) * 100}%`,
                    }}
                    transition={{
                      duration: 0.7,
                      delay: 0.1 + index * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </StudioGlassCard>
    </div>
  )
}
