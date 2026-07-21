'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { cn } from '@/lib/utils'

export interface StudioChartPoint {
  label: string
  value: number
}

export interface StudioChartProps {
  title: string
  subtitle?: string
  data: StudioChartPoint[]
  badge?: string
  gradient?: string
  formatValue?: (value: number) => string
  className?: string
}

export function StudioChart({
  title,
  subtitle = 'This period',
  data,
  badge,
  gradient = 'from-violet-600 via-fuchsia-500 to-pink-400',
  formatValue,
  className,
}: StudioChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <StudioGlassCard glow="creator" className={cn('p-5 sm:p-6', className)}>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium tracking-[0.1em] text-white/40 uppercase">
            {subtitle}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
        </div>
        {badge ? (
          <span className="rounded-full border border-fuchsia-400/25 bg-fuchsia-500/15 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-200">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex h-40 items-end gap-2 sm:gap-3">
        {data.map((item, index) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end">
              <motion.div
                title={formatValue ? formatValue(item.value) : String(item.value)}
                className={cn(
                  'w-full rounded-t-xl bg-gradient-to-t',
                  gradient
                )}
                initial={
                  prefersReducedMotion
                    ? { height: `${(item.value / max) * 100}%` }
                    : { height: 0 }
                }
                animate={{ height: `${(item.value / max) * 100}%` }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ minHeight: 8 }}
              />
            </div>
            <span className="text-[10px] font-medium text-white/40">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </StudioGlassCard>
  )
}
