'use client'

import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  change?: number
  icon: LucideIcon
  delay?: number
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  delay = 0,
  className,
}: StatCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const positive = change !== undefined && change >= 0

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      className={className}
    >
      <StudioGlassCard glow="creator" className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium tracking-[0.08em] text-white/45 uppercase">
              {label}
            </p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">
              {value}
            </p>
            {change !== undefined ? (
              <p
                className={cn(
                  'mt-1.5 text-[12px] font-medium',
                  positive ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {positive ? '+' : ''}
                {change.toFixed(1)}% this month
              </p>
            ) : null}
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/25 to-pink-500/20">
            <Icon className="size-5 text-fuchsia-200" strokeWidth={1.75} />
          </div>
        </div>
      </StudioGlassCard>
    </motion.div>
  )
}
