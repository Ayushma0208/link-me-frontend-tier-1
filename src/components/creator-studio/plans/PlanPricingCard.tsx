'use client'

import type { DragEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, GripVertical, Pencil, Star } from 'lucide-react'

import type { CreatorPlan } from '@/data/creator-studio'
import { cn, formatCurrency } from '@/lib/utils'

const ACCENT: Record<
  CreatorPlan['accent'],
  { ring: string; glow: string; badge: string; button: string }
> = {
  violet: {
    ring: 'border-fuchsia-400/30',
    glow: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
    badge: 'border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-100',
    button: 'from-violet-500 via-fuchsia-500 to-pink-500',
  },
  amber: {
    ring: 'border-amber-400/30',
    glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
    badge: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
    button: 'from-amber-500 via-orange-500 to-pink-500',
  },
  sky: {
    ring: 'border-sky-400/30',
    glow: 'from-sky-500/20 via-cyan-500/10 to-transparent',
    badge: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
    button: 'from-sky-500 via-cyan-500 to-teal-400',
  },
  rose: {
    ring: 'border-rose-400/30',
    glow: 'from-rose-500/20 via-pink-500/10 to-transparent',
    badge: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
    button: 'from-rose-500 via-pink-500 to-fuchsia-500',
  },
}

export interface PlanPricingCardProps {
  plan: CreatorPlan
  billing: 'monthly' | 'yearly'
  index?: number
  onEdit?: () => void
  onToggle?: () => void
  onDragStart?: (e: DragEvent) => void
  onDragOver?: (e: DragEvent) => void
  onDrop?: (e: DragEvent) => void
  className?: string
}

export function PlanPricingCard({
  plan,
  billing,
  index = 0,
  onEdit,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
  className,
}: PlanPricingCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const accent = ACCENT[plan.accent]
  const price =
    billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)
  const periodLabel = billing === 'monthly' ? '/mo' : '/mo billed yearly'

  return (
    <motion.article
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: plan.enabled ? 1 : 0.72, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6',
        plan.featured ? accent.ring : 'border-white/10',
        plan.featured && 'ring-1 ring-fuchsia-400/20',
        className
      )}
    >
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        aria-hidden
      />
      <div className="relative z-10 flex h-full flex-col pointer-events-none">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br',
          accent.glow
        )}
      />

      <div className="relative mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-extrabold tracking-tight text-white">
              {plan.name}
            </h3>
            {plan.badge ? (
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                  accent.badge
                )}
              >
                {plan.badge}
              </span>
            ) : null}
            {plan.featured ? (
              <Star className="size-4 fill-amber-300 text-amber-300" aria-hidden />
            ) : null}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-white/50">
            {plan.description}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/30 p-1.5 text-white/40">
          <GripVertical className="size-4" />
        </span>
      </div>

      <div className="relative mt-auto">
        <p className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-white">
            {formatCurrency(price)}
          </span>
          <span className="text-[13px] text-white/40">{periodLabel}</span>
        </p>
        {billing === 'yearly' ? (
          <p className="mt-1 text-[12px] text-white/35">
            {formatCurrency(plan.yearlyPrice)} / year
          </p>
        ) : (
          <p className="mt-1 text-[12px] text-white/35">
            or {formatCurrency(plan.yearlyPrice)} / year
          </p>
        )}
      </div>

      <ul className="relative mt-5 space-y-2.5">
        {plan.benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2.5 text-[13px] text-white/70"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
              <Check className="size-3 text-fuchsia-200" strokeWidth={3} />
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      <div className="relative mt-6 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] text-[12px] font-semibold text-white/80 hover:text-white"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={plan.enabled}
          onClick={onToggle}
          className={cn(
            'relative h-10 w-14 shrink-0 rounded-full transition-colors',
            plan.enabled
              ? `bg-gradient-to-r ${accent.button}`
              : 'bg-white/15'
          )}
          aria-label={plan.enabled ? 'Disable plan' : 'Enable plan'}
        >
          <span
            className={cn(
              'absolute top-1.5 size-7 rounded-full bg-white shadow transition-transform',
              plan.enabled ? 'left-[26px]' : 'left-1.5'
            )}
          />
        </button>
      </div>

      {!plan.enabled ? (
        <p className="relative mt-3 text-center text-[11px] font-medium tracking-wide text-white/35 uppercase">
          Disabled — hidden from fans
        </p>
      ) : null}
      </div>
    </motion.article>
  )
}
