'use client'

import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import {
  pricingPlans,
  YEARLY_SAVINGS_PERCENT,
  type BillingPeriod,
} from '@/data/landing'
import { cn } from '@/lib/utils'

import { PricingCard } from './PricingCard'

interface PricingProps {
  className?: string
}

const easeOut = [0.22, 1, 0.36, 1] as const

export function Pricing({ className }: PricingProps) {
  const prefersReducedMotion = useReducedMotion()
  const [billing, setBilling] = useState<BillingPeriod>('monthly')
  const savingsId = useId()
  const headingId = 'pricing-heading'

  return (
    <section
      id="pricing"
      className={cn('relative overflow-hidden bg-black py-20 sm:py-24 lg:py-28', className)}
      aria-labelledby={headingId}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[28%] left-1/2 size-[min(720px,90vw)] -translate-x-1/2 rounded-full bg-white/[0.028] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-16">
        <motion.div
          className="mx-auto max-w-[40rem] text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          <span
            className={cn(
              'inline-flex items-center rounded-full border border-white/[0.1]',
              'bg-white/[0.035] px-3.5 py-1 text-[11px] font-medium tracking-[0.18em]',
              'text-white/50 uppercase'
            )}
          >
            Pricing
          </span>

          <h2
            id={headingId}
            className="mt-5 text-[1.875rem] leading-[1.15] font-extrabold tracking-[-0.035em] text-white sm:text-4xl sm:leading-[1.12] lg:text-[2.75rem] lg:leading-[1.08]"
          >
            Simple pricing for every creator
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/55 sm:mt-5 sm:text-lg sm:leading-relaxed">
            Start free. Upgrade when you’re ready to monetize every interaction.
          </p>
        </motion.div>

        <div className="mt-9 flex flex-col items-center sm:mt-11">
          <div
            role="group"
            aria-label="Billing period"
            aria-describedby={savingsId}
            className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.035] p-1"
          >
            {([
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly' },
            ] as const).map((option) => {
              const active = billing === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBilling(option.id)}
                  aria-pressed={active}
                  className={cn(
                    'relative rounded-full px-5 py-2 text-sm font-medium outline-none',
                    'transition-colors duration-200',
                    'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                    active ? 'text-black' : 'text-white/50 hover:text-white/80'
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="pricing-billing-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 480, damping: 36 }
                      }
                    />
                  ) : null}
                  <span className="relative z-10">{option.label}</span>
                </button>
              )
            })}
          </div>

          <p
            id={savingsId}
            aria-live="polite"
            className={cn(
              'mt-3 min-h-[1.25rem] text-center text-xs tracking-[-0.01em] text-white/45 sm:text-[13px]',
              billing === 'yearly' ? 'opacity-100' : 'opacity-0'
            )}
          >
            Save {YEARLY_SAVINGS_PERCENT}% with yearly billing
          </p>
        </div>

        <motion.div
          className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:items-stretch xl:gap-4 xl:pt-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.07,
                delayChildren: prefersReducedMotion ? 0 : 0.05,
              },
            },
          }}
        >
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billing={billing}
              prefersReducedMotion={!!prefersReducedMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
