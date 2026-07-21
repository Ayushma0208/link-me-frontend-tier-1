'use client'

import { useId, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { cn } from '@/lib/utils'

export interface StudioLineSeries {
  key: string
  label: string
  color: string
  values: number[]
}

export interface StudioLineChartProps {
  title: string
  subtitle?: string
  labels: string[]
  series: StudioLineSeries[]
  badge?: string
  formatValue?: (value: number) => string
  className?: string
}

function buildPath(
  values: number[],
  max: number,
  width: number,
  height: number,
  padX: number,
  padY: number
) {
  const n = values.length
  if (n === 0) return ''
  const innerW = width - padX * 2
  const innerH = height - padY * 2
  return values
    .map((v, i) => {
      const x = padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
      const y = padY + innerH - (v / max) * innerH
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function buildArea(
  values: number[],
  max: number,
  width: number,
  height: number,
  padX: number,
  padY: number
) {
  const line = buildPath(values, max, width, height, padX, padY)
  if (!line) return ''
  const n = values.length
  const innerW = width - padX * 2
  const baseY = height - padY
  const endX = padX + (n === 1 ? innerW / 2 : innerW)
  const startX = padX + (n === 1 ? innerW / 2 : 0)
  return `${line} L ${endX.toFixed(1)} ${baseY} L ${startX.toFixed(1)} ${baseY} Z`
}

export function StudioLineChart({
  title,
  subtitle = 'This period',
  labels,
  series,
  badge,
  formatValue,
  className,
}: StudioLineChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const gradId = useId()
  const width = 640
  const height = 220
  const padX = 12
  const padY = 16

  const max = useMemo(() => {
    const all = series.flatMap((s) => s.values)
    return Math.max(...all, 1)
  }, [series])

  return (
    <StudioGlassCard glow="creator" className={cn('p-5 sm:p-6', className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium tracking-[0.1em] text-white/40 uppercase">
            {subtitle}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[11px] font-medium text-white/50">
                {s.label}
              </span>
            </div>
          ))}
          {badge ? (
            <span className="rounded-full border border-fuchsia-400/25 bg-fuchsia-500/15 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-200">
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-48 w-full sm:h-56"
          role="img"
          aria-label={title}
        >
          {[0.25, 0.5, 0.75, 1].map((t) => {
            const y = padY + (height - padY * 2) * (1 - t)
            return (
              <line
                key={t}
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            )
          })}

          {series.map((s, si) => {
            const area = buildArea(s.values, max, width, height, padX, padY)
            const line = buildPath(s.values, max, width, height, padX, padY)
            const gid = `${gradId}-${s.key}`
            return (
              <g key={s.key}>
                <defs>
                  <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <motion.path
                  d={area}
                  fill={`url(#${gid})`}
                  initial={
                    prefersReducedMotion ? undefined : { opacity: 0 }
                  }
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: si * 0.1 }}
                />
                <motion.path
                  d={line}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={
                    prefersReducedMotion
                      ? undefined
                      : { pathLength: 0, opacity: 0 }
                  }
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.9,
                    delay: si * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
                {s.values.map((v, i) => {
                  const n = s.values.length
                  const innerW = width - padX * 2
                  const innerH = height - padY * 2
                  const x =
                    padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
                  const y = padY + innerH - (v / max) * innerH
                  return (
                    <circle
                      key={`${s.key}-${i}`}
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill="#0a0a10"
                      stroke={s.color}
                      strokeWidth={2}
                    >
                      <title>
                        {labels[i]} · {s.label}:{' '}
                        {formatValue ? formatValue(v) : v}
                      </title>
                    </circle>
                  )
                })}
              </g>
            )
          })}
        </svg>

        <div className="mt-1 flex justify-between px-1">
          {labels.map((label) => (
            <span
              key={label}
              className="text-[10px] font-medium text-white/40"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </StudioGlassCard>
  )
}
