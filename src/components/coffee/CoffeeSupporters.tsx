'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'

import type { CoffeeSupporter } from '@/data/creator-studio'
import { cn, formatCurrency } from '@/lib/utils'

export interface CoffeeSupportersProps {
  supporters: CoffeeSupporter[]
  className?: string
  /** Hide tip amounts on the fan-facing coffee page. */
  hideAmounts?: boolean
}

export function CoffeeSupporters({
  supporters,
  className,
  hideAmounts = false,
}: CoffeeSupportersProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!supporters.length) return null

  return (
    <section
      className={cn(
        'rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          Recent supporters
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-200/70">
          <Heart className="size-3 fill-amber-200/70" aria-hidden />
          {supporters.length} tips
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {supporters.map((supporter, index) => (
          <motion.li
            key={supporter.id}
            initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/20 text-[12px] font-bold text-amber-100">
              {supporter.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13px] font-semibold text-white">
                  {supporter.name}
                </p>
                {hideAmounts ? null : (
                  <p className="shrink-0 text-[12px] font-medium text-amber-200/80">
                    {formatCurrency(supporter.amount)}
                  </p>
                )}
              </div>
              {supporter.message ? (
                <p className="mt-1 text-[12px] leading-relaxed text-white/45">
                  {supporter.message}
                </p>
              ) : null}
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
