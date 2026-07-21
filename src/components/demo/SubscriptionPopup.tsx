'use client'

import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface SubscriptionPopupProps {
  title: string
  price: string
  period: string
  cta: string
  icon: LucideIcon
  className?: string
  delay?: number
}

export function SubscriptionPopup({
  title,
  price,
  period,
  cta,
  icon: Icon,
  className,
  delay = 0,
}: SubscriptionPopupProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn('absolute z-30', className)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: -14, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={cn(
          'w-[160px] rounded-2xl border border-white/15 bg-white p-3.5',
          'text-black shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:w-[176px]'
        )}
        animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 4.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.8 + delay,
              }
        }
      >
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-black text-white">
            <Icon className="size-3.5" aria-hidden="true" />
          </div>
          <p className="text-[13px] font-semibold tracking-[-0.02em]">{title}</p>
        </div>
        <div className="mt-2.5 flex items-baseline gap-0.5">
          <span className="text-xl font-extrabold tracking-[-0.04em]">{price}</span>
          <span className="text-[11px] text-black/50">{period}</span>
        </div>
        <div className="mt-3 flex h-8 items-center justify-center rounded-full bg-black text-[12px] font-semibold text-white">
          {cta}
        </div>
      </motion.div>
    </motion.div>
  )
}
