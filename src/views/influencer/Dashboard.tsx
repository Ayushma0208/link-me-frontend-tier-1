'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye,
  DollarSign,
  Coffee,
  ImagePlus,
  CircleDot,
  Sparkles,
  Pencil,
  Activity,
  Crown,
  Loader2,
  Phone,
  Video,
  Radio,
  MessageSquare,
  LockKeyhole,
} from 'lucide-react'

import { ActivityFeed } from '@/components/creator-studio/ActivityFeed'
import { QuickAction } from '@/components/creator-studio/QuickAction'
import { StatCard } from '@/components/creator-studio/StatCard'
import { StudioChart } from '@/components/creator-studio/StudioChart'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import {
  emptyMonthSeries,
  emptyWeekSeries,
  fetchCreatorDashboard,
  fetchCreatorEarnings,
  parseCount,
  parseMoney,
  type CreatorChartPoint,
  type CreatorDashboardProfile,
  type CreatorEarningsBreakdown,
} from '@/lib/studio-api'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatFollowers } from '@/lib/utils'

const FALLBACK_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=Creator'

const EMPTY_EARNINGS: CreatorEarningsBreakdown = {
  currency: 'INR',
  voiceCalls: '0',
  videoCalls: '0',
  live: '0',
  messages: '0',
  exclusives: '0',
  coffee: '0',
}

export function InfluencerDashboard() {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<CreatorDashboardProfile | null>(null)
  const [earnings, setEarnings] =
    useState<CreatorEarningsBreakdown>(EMPTY_EARNINGS)
  const [weekRevenue, setWeekRevenue] =
    useState<CreatorChartPoint[]>(() => emptyWeekSeries())
  const [monthSubscribers, setMonthSubscribers] =
    useState<CreatorChartPoint[]>(() => emptyMonthSeries())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchCreatorDashboard()
        if (!cancelled) setProfile(data.profile)
        try {
          const earningsData = await fetchCreatorEarnings()
          if (!cancelled) {
            setEarnings(earningsData.earnings)
            if (earningsData.charts?.weekRevenue?.length) {
              setWeekRevenue(earningsData.charts.weekRevenue)
            }
            if (earningsData.charts?.monthSubscribers?.length) {
              setMonthSubscribers(earningsData.charts.monthSubscribers)
            }
          }
        } catch (earningsErr) {
          if (!cancelled) {
            setError(
              earningsErr instanceof Error
                ? earningsErr.message
                : 'Could not load earnings'
            )
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load dashboard'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const displayName =
    profile?.user.displayName || user?.name || 'Creator'
  const username =
    profile?.user.username || user?.username || 'creator'
  const avatar =
    profile?.user.avatarUrl || user?.avatar || FALLBACK_AVATAR
  const firstName = displayName.split(' ')[0] || 'Creator'

  const analytics = profile?.analytics
  const subscribers = profile?.subscriberCount ?? 0
  const coffee = Math.max(
    parseMoney(analytics?.coffeeRevenue),
    Number(earnings.coffee) || 0
  )
  const views = parseCount(analytics?.views)
  const engagement = parseMoney(analytics?.engagementRate)
  // Prefer live earnings (calls/messages/coffee/etc.) over the analytics snapshot,
  // which often stays at 0 when creatorAnalytics rows are not written.
  const earningsTotal =
    Number(earnings.voiceCalls) +
    Number(earnings.videoCalls) +
    Number(earnings.live) +
    Number(earnings.messages) +
    Number(earnings.exclusives) +
    coffee
  const revenue = Number.isFinite(earningsTotal) ? earningsTotal : 0

  const featuredPlan = profile?.plans.find((p) => p.isFeatured && p.isActive)
  const activePlan = featuredPlan || profile?.plans.find((p) => p.isActive)
  const weekRevenueTotal = weekRevenue.reduce((sum, p) => sum + p.value, 0)

  return (
    <div>
      <StudioPageHeader
        title={`Welcome back, ${firstName}`}
        description="Your creator workspace — stats update as you grow."
        actions={
          <Link
            href={`/@${username}`}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[13px] font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/[0.1]"
          >
            <Eye className="size-4" />
            Preview profile
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 text-[13px] text-rose-300">{error}</p>
      ) : null}

      {loading ? (
        <div className="mb-8 flex min-h-[120px] items-center justify-center gap-2 text-white/50">
          <Loader2 className="size-4 animate-spin" />
          Loading your studio…
        </div>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Subscribers"
            value={formatFollowers(subscribers)}
            icon={Crown}
            delay={0.04}
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(revenue)}
            icon={DollarSign}
            delay={0.08}
          />
          <StatCard
            label="Coffee Donations"
            value={formatCurrency(coffee)}
            icon={Coffee}
            delay={0.12}
          />
          <StatCard
            label="Views"
            value={formatFollowers(views)}
            icon={Eye}
            delay={0.16}
          />
          <StatCard
            label="Post Engagement"
            value={`${engagement.toFixed(1)}%`}
            icon={Activity}
            delay={0.2}
          />
        </div>
      )}

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              Earnings by source
            </h2>
            <p className="mt-1 text-[13px] text-white/45">
              Your all-time gross earnings from paid creator interactions.
            </p>
          </div>
          <Link
            href="/influencer/revenue"
            className="text-xs font-semibold text-fuchsia-300 hover:text-fuchsia-200"
          >
            View revenue →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Voice Calls"
            value={formatCurrency(Number(earnings.voiceCalls))}
            icon={Phone}
          />
          <StatCard
            label="Video Calls"
            value={formatCurrency(Number(earnings.videoCalls))}
            icon={Video}
            delay={0.04}
          />
          <StatCard
            label="Live Events"
            value={formatCurrency(Number(earnings.live))}
            icon={Radio}
            delay={0.08}
          />
          <StatCard
            label="Messages"
            value={formatCurrency(Number(earnings.messages))}
            icon={MessageSquare}
            delay={0.12}
          />
          <StatCard
            label="Exclusive Posts"
            value={formatCurrency(Number(earnings.exclusives))}
            icon={LockKeyhole}
            delay={0.16}
          />
          <StatCard
            label="Coffee Tips"
            value={formatCurrency(coffee)}
            icon={Coffee}
            delay={0.2}
          />
        </div>
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <StudioChart
            title="Revenue"
            subtitle="This week"
            data={weekRevenue}
            badge={weekRevenueTotal || subscribers || revenue ? 'Live' : 'New'}
            formatValue={(v) => formatCurrency(v)}
          />
          <StudioChart
            title="Subscriptions"
            subtitle="Active members"
            data={monthSubscribers}
            badge="Live"
            gradient="from-amber-600 via-orange-500 to-pink-400"
            formatValue={(v) => String(Math.round(v))}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <StudioGlassCard glow="creator" className="p-5">
            <h2 className="text-lg font-bold text-white">Quick actions</h2>
            <p className="mt-1 text-[13px] text-white/45">
              Ship content and grow revenue.
            </p>
            <div className="mt-4 space-y-2.5">
              <QuickAction
                label="Create Post"
                description="Image, video, reel, or carousel"
                href="/influencer/create/post"
                icon={ImagePlus}
                delay={0.05}
              />
              <QuickAction
                label="Upload Story"
                description="24-hour ephemeral content"
                href="/influencer/create?type=story"
                icon={CircleDot}
                delay={0.1}
              />
              <QuickAction
                label="Add Highlight"
                description="Pin lasting story collections"
                href="/influencer/create?type=highlight"
                icon={Sparkles}
                delay={0.15}
              />
              <QuickAction
                label="Edit Profile"
                description="Bio, cover, and appearance"
                href="/influencer/settings"
                icon={Pencil}
                delay={0.2}
              />
            </div>
          </StudioGlassCard>

          <StudioGlassCard className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px] font-bold text-white">
                Subscription Overview
              </h2>
              <Link
                href="/influencer/plans"
                className="text-[12px] font-medium text-fuchsia-300 hover:text-pink-200"
              >
                Manage
              </Link>
            </div>
            <p className="mt-1 text-[12px] text-white/40">
              {activePlan
                ? `${activePlan.name} · ${formatCurrency(Number(activePlan.price))}/mo`
                : 'No plan yet — set one up to start earning'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Active',
                  value: formatFollowers(subscribers),
                },
                {
                  label: 'New this month',
                  value: `+${analytics?.newSubscribers ?? 0}`,
                },
                {
                  label: 'MRR',
                  value: formatCurrency(
                    parseMoney(analytics?.subscriptionRevenue)
                  ),
                },
                {
                  label: 'Posts',
                  value: formatFollowers(profile?.postCount ?? 0),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                >
                  <p className="text-[15px] font-bold text-white">{item.value}</p>
                  <p className="mt-0.5 text-[11px] text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          </StudioGlassCard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActivityFeed
          title="Recent Subscribers"
          href="/influencer/subscribers"
          items={[]}
          emptyLabel="No subscribers yet"
        />
        <ActivityFeed
          title="Recent Purchases"
          href="/influencer/revenue"
          items={[]}
          emptyLabel="No purchases yet"
        />
        <ActivityFeed
          title="Coffee Donations"
          href="/influencer/coffee"
          items={[]}
          emptyLabel="No coffee tips yet"
        />
        <ActivityFeed
          title="Recent Comments"
          href="/influencer/content"
          items={[]}
          emptyLabel="No comments yet"
        />
      </div>

      <StudioGlassCard className="mt-6 overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="relative size-14 overflow-hidden rounded-2xl ring-1 ring-white/15">
              <Image
                src={avatar}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                unoptimized={avatar.includes('dicebear') || avatar.startsWith('data:')}
              />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white">{displayName}</p>
              <p className="text-[13px] text-white/45">@{username}</p>
            </div>
          </div>
          <Link
            href="/influencer/settings"
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 text-[13px] font-semibold text-white shadow-[0_12px_32px_rgba(217,70,239,0.35)]"
          >
            Edit profile
          </Link>
        </div>
      </StudioGlassCard>
    </div>
  )
}
