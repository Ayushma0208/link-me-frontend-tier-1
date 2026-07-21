'use client'

import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface AnalyticsPopupProps {
  title: string
  metric: string
  label: string
  change: string
  icon: LucideIcon
  className?: string
  delay?: number
}

export function AnalyticsPopup({
  title,
  metric,
  label,
  change,
  icon: Icon,
  className,
  delay = 0,
}: AnalyticsPopupProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn('absolute z-30', className)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={cn(
          'w-[168px] rounded-2xl border border-white/12 bg-white/[0.08] p-3.5',
          'shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:w-[184px]'
        )}
        animate={prefersReducedMotion ? undefined : { y: [0, 7, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 5.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1 + delay,
              }
        }
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium tracking-[0.1em] text-white/45 uppercase">
            {title}
          </p>
          <Icon className="size-3.5 text-white/50" aria-hidden="true" />
        </div>
        <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-white">{metric}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-[11px] text-white/50">{label}</span>
          <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            {change}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
