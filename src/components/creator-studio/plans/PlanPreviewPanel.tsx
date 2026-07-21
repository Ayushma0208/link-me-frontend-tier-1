'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Check } from 'lucide-react'
import Image from 'next/image'

import type { CreatorPlan } from '@/data/creator-studio'
import { useAuthStore } from '@/stores/auth'
import { cn, formatCurrency } from '@/lib/utils'

const FALLBACK_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=Creator'

export interface PlanPreviewPanelProps {
  plan: CreatorPlan | null
  billing: 'monthly' | 'yearly'
  className?: string
}

export function PlanPreviewPanel({
  plan,
  billing,
  className,
}: PlanPreviewPanelProps) {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const displayName = user?.name || user?.username || 'Creator'
  const username = user?.username || 'creator'
  const avatar = user?.avatar || FALLBACK_AVATAR

  if (!plan) {
    return (
      <div
        className={cn(
          'flex min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] px-6 text-center text-[14px] text-white/35',
          className
        )}
      >
        Select or create a plan to preview how fans will see it.
      </div>
    )
  }

  const price =
    billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)

  return (
    <motion.div
      key={plan.id + billing}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.05] shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl',
        className
      )}
    >
      <div className="border-b border-white/8 bg-gradient-to-br from-violet-500/15 via-transparent to-pink-500/10 px-5 py-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          Fan preview
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative size-11 overflow-hidden rounded-2xl ring-1 ring-white/15">
            <Image
              src={avatar}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
              unoptimized={
                avatar.includes('dicebear') || avatar.startsWith('data:')
              }
            />
          </div>
          <div>
            <p className="flex items-center gap-1 text-[14px] font-semibold text-white">
              {displayName}
              <BadgeCheck className="size-3.5 fill-sky-500 text-white" />
            </p>
            <p className="text-[12px] text-white/40">@{username}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-extrabold text-white">{plan.name}</h3>
            {plan.badge ? (
              <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-fuchsia-100 uppercase">
                {plan.badge}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-white/50">
            {plan.description}
          </p>
        </div>

        <p className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-white">
            {formatCurrency(price)}
          </span>
          <span className="text-[13px] text-white/40">
            {billing === 'monthly' ? '/month' : '/mo · yearly'}
          </span>
        </p>

        <ul className="space-y-2.5">
          {plan.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2.5 text-[13px] text-white/70"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/15 text-fuchsia-200">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-[14px] font-semibold text-white shadow-[0_14px_40px_rgba(217,70,239,0.35)]"
        >
          Subscribe · {formatCurrency(price)}
          {billing === 'monthly' ? '/mo' : '/mo'}
        </button>
        <p className="text-center text-[11px] text-white/30">
          Preview only — no real checkout
        </p>
      </div>
    </motion.div>
  )
}
