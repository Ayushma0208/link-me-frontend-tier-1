'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import {
  formatPlanPrice,
  getPlanPeriodLabel,
  type BillingPeriod,
  type PricingPlan,
} from '@/data/landing'
import { cn } from '@/lib/utils'

export interface PricingCardProps {
  plan: PricingPlan
  billing: BillingPeriod
  prefersReducedMotion?: boolean
  className?: string
}

const easeOut = [0.22, 1, 0.36, 1] as const

export function PricingCard({
  plan,
  billing,
  prefersReducedMotion = false,
  className,
}: PricingCardProps) {
  const price = formatPlanPrice(plan, billing)
  const period = getPlanPeriodLabel(plan, billing)
  const priceId = `price-${plan.id}`
  const featuresId = `features-${plan.id}`

  return (
    <motion.article
      variants={{
        hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: easeOut },
        },
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.25, ease: easeOut },
            }
      }
      aria-labelledby={`plan-${plan.id}`}
      aria-describedby={`${priceId} ${featuresId}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[32px] border p-6 sm:p-7',
        'will-change-transform',
        'transition-[border-color,box-shadow,background-color] duration-300 ease-out',
        plan.highlighted
          ? cn(
              'z-[1] border-white/20 bg-white/[0.09]',
              'shadow-[0_24px_64px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)]',
              'xl:scale-[1.03]',
              'hover:border-white/30 hover:bg-white/[0.11]',
              'hover:shadow-[0_32px_72px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.16)]'
            )
          : cn(
              'border-white/[0.09] bg-white/[0.035]',
              'shadow-[0_12px_36px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)]',
              'hover:border-white/18 hover:bg-white/[0.055]',
              'hover:shadow-[0_20px_48px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)]'
            ),
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br',
          plan.highlighted
            ? 'from-white/[0.12] via-white/[0.02] to-transparent'
            : 'from-white/[0.06] via-transparent to-transparent'
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 min-h-[26px]">
          {plan.badge ? (
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-black uppercase">
              {plan.badge}
            </span>
          ) : null}
        </div>

        <h3
          id={`plan-${plan.id}`}
          className="text-[1.0625rem] font-semibold tracking-[-0.025em] text-white sm:text-lg"
        >
          {plan.name}
        </h3>

        <p className="mt-2 min-h-[2.75rem] text-[13px] leading-relaxed text-white/50 sm:text-sm sm:leading-relaxed">
          {plan.description}
        </p>

        <div id={priceId} className="mt-6 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <motion.span
            key={`${plan.id}-${billing}-${price}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: easeOut }}
            className="text-[2.25rem] leading-none font-extrabold tracking-[-0.045em] text-white tabular-nums sm:text-[2.5rem]"
          >
            {price}
          </motion.span>
          <span className="text-[13px] text-white/40">{period}</span>
        </div>

        <p
          className={cn(
            'mt-2 min-h-[1rem] text-[11px] text-white/35',
            billing === 'yearly' && plan.monthlyPrice > 0 ? 'visible' : 'invisible'
          )}
          aria-hidden={!(billing === 'yearly' && plan.monthlyPrice > 0)}
        >
          ${plan.yearlyPrice} billed annually
        </p>

        <ul
          id={featuresId}
          className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-white/[0.07] pt-6 sm:mt-7 sm:gap-3 sm:pt-7"
        >
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[13px] leading-snug text-white/65 sm:text-sm"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-white/55 sm:size-4"
                aria-hidden="true"
                strokeWidth={2}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          render={<Link href="/signup" />}
          aria-label={`${plan.cta} — ${plan.name} plan`}
          className={cn(
            'mt-7 h-11 w-full rounded-full text-[14px] font-semibold sm:mt-8 sm:h-12 sm:text-[15px]',
            'outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
            'transition-[background-color,transform,box-shadow] duration-200',
            'active:scale-[0.99]',
            plan.highlighted
              ? 'bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.12)] hover:bg-neutral-100'
              : 'border border-white/12 bg-white/[0.07] text-white hover:border-white/20 hover:bg-white/[0.12]'
          )}
        >
          {plan.cta}
        </Button>
      </div>
    </motion.article>
  )
}
