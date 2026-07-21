'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import {
  usePublicCreatorsPool,
  useSubscriptionsMe,
  useSuggestedFromPool,
} from '@/lib/hooks/use-shared-queries'
import { useFollowStore } from '@/stores/follows'
import { formatCurrency, formatFollowers } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RightSidebarProps {
  className?: string
}

export function RightSidebar({ className }: RightSidebarProps) {
  const prefersReducedMotion = useReducedMotion()
  const byHandle = useFollowStore((s) => s.byHandle)
  const toggleFollow = useFollowStore((s) => s.toggle)
  const { data: suggested = [] } = useSuggestedFromPool(6)
  const { data: pool = [] } = usePublicCreatorsPool()
  const { data: memberships = [] } = useSubscriptionsMe<{
    entitled: boolean
    plan: { price: string; creatorProfileId: string }
  }>()

  const latest = pool[0] ?? null

  const { subSummary, subscribedIds } = useMemo(() => {
    const active = (memberships ?? []).filter((s) => s.entitled)
    const monthlySpend = active.reduce(
      (sum, s) => sum + (Number(s.plan.price) || 0),
      0
    )
    return {
      subSummary: { active: active.length, monthlySpend },
      subscribedIds: new Set(
        active.map((s) => s.plan.creatorProfileId).filter(Boolean)
      ),
    }
  }, [memberships])

  return (
    <motion.aside
      initial={prefersReducedMotion ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 hidden h-svh w-[360px] shrink-0 flex-col gap-4 overflow-y-auto',
        'border-l border-white/[0.07] bg-[#0a0a10]/80 px-4 py-5 backdrop-blur-2xl',
        'xl:flex',
        className
      )}
    >
      <DashboardCard title="Suggested Creators">
        <div className="space-y-3">
          {suggested.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-white/35">
              You’re caught up — no new creators to suggest
            </p>
          ) : (
            suggested.map((creator) => {
              const handle = creator.handle.toLowerCase()
              const following = Boolean(byHandle[handle])
              const subscribed = subscribedIds.has(creator.id)
              return (
                <div
                  key={creator.id}
                  className="flex items-center gap-3 rounded-2xl border border-transparent p-1.5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <Link
                    href={`/${creator.handle}`}
                    className="relative size-11 shrink-0 overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={creator.avatar}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </Link>
                  <Link href={`/${creator.handle}`} className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {creator.name}
                    </p>
                    <p className="truncate text-[11px] text-white/40">
                      @{creator.handle} · {formatFollowers(creator.followers)}
                    </p>
                  </Link>
                  {subscribed ? (
                    <Link
                      href={`/${creator.handle}`}
                      className="rounded-full border border-violet-400/35 bg-violet-500/15 px-2.5 py-1 text-[11px] font-semibold text-violet-100"
                    >
                      Subscribed
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toggleFollow({
                          id: creator.id,
                          handle: creator.handle,
                          name: creator.name,
                          avatar: creator.avatar,
                          href: `/${creator.handle}`,
                        })
                      }
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
                        following
                          ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                          : 'border-white/10 text-white/70 hover:bg-white/[0.06]'
                      )}
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </DashboardCard>

      <DashboardCard title="Subscription Summary">
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[28px] font-extrabold tracking-tight text-white">
                {subSummary.active}
              </p>
              <p className="text-[12px] text-white/40">Active memberships</p>
            </div>
            <p className="text-[13px] font-semibold text-white/70">
              {formatCurrency(subSummary.monthlySpend)}
              <span className="font-normal text-white/35"> /mo</span>
            </p>
          </div>
          <Link
            href="/user/subscriptions"
            className="block rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-[12px] text-white/45 hover:text-white"
          >
            View all subscriptions
          </Link>
        </div>
      </DashboardCard>

      {latest ? (
        <DashboardCard title="Latest Creator Joined">
          <Link href={`/${latest.handle}`} className="flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-2xl ring-2 ring-[#ff4d9a]/35">
              <Image
                src={latest.avatar}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">{latest.name}</p>
              <p className="text-[12px] text-white/40">@{latest.handle}</p>
              <p className="mt-0.5 text-[11px] text-emerald-300/80">
                AI creator on Linkme
              </p>
            </div>
          </Link>
        </DashboardCard>
      ) : null}
    </motion.aside>
  )
}
