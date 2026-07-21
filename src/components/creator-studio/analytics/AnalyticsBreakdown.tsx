'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import type { AnalyticsBreakdownRow } from '@/data/creator-studio'
import { cn, formatFollowers } from '@/lib/utils'

interface AnalyticsBreakdownProps {
  title: string
  subtitle?: string
  rows: AnalyticsBreakdownRow[]
  gradient?: string
  className?: string
}

export function AnalyticsBreakdown({
  title,
  subtitle,
  rows,
  gradient = 'from-violet-500 via-fuchsia-500 to-pink-400',
  className,
}: AnalyticsBreakdownProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <StudioGlassCard className={cn('p-5', className)}>
      <h3 className="text-[15px] font-bold text-white">{title}</h3>
      {subtitle ? (
        <p className="mt-0.5 text-[12px] text-white/40">{subtitle}</p>
      ) : null}
      <div className="mt-4 space-y-3.5">
        {rows.map((row, index) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[12px]">
              <span className="truncate text-white/65">{row.label}</span>
              <span className="shrink-0 font-semibold text-white">
                {row.pct}%
                <span className="ml-1.5 font-normal text-white/35">
                  {formatFollowers(row.value)}
                </span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
                initial={
                  prefersReducedMotion
                    ? { width: `${row.pct}%` }
                    : { width: 0 }
                }
                animate={{ width: `${row.pct}%` }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </StudioGlassCard>
  )
}
