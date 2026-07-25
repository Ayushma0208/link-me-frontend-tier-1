'use client'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type OptimalTimeHeatmapProps = {
  grid: number[][]
  recommendation: string | null
  sampleSize: number
  timezone: string
  className?: string
}

export function OptimalTimeHeatmap({
  grid,
  recommendation,
  sampleSize,
  timezone,
  className,
}: OptimalTimeHeatmapProps) {
  const max = Math.max(...grid.flat(), 1)

  return (
    <StudioGlassCard glow="creator" className={cn('p-5 sm:p-6', className)}>
      <div className="mb-4">
        <p className="text-[12px] font-medium tracking-[0.1em] text-white/40 uppercase">
          Schedule
        </p>
        <h3 className="mt-1 text-lg font-bold text-white">
          Optimal time to go live
        </h3>
        {recommendation ? (
          <p className="mt-2 text-sm text-fuchsia-100/90">{recommendation}</p>
        ) : (
          <p className="mt-2 text-sm text-white/45">
            Go live a few more times — we need audience join activity to
            recommend a window.
          </p>
        )}
        <p className="mt-1 text-[11px] text-white/35">
          {sampleSize} joins · {timezone}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-grid min-w-full grid-cols-[auto_repeat(24,minmax(10px,1fr))] gap-0.5">
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="text-center text-[9px] text-white/30"
              title={`${h}:00`}
            >
              {h % 6 === 0 ? h : ''}
            </div>
          ))}
          {DAY_LABELS.map((day, dow) => (
            <div key={day} className="contents">
              <div className="pr-2 text-[10px] font-medium text-white/45">
                {day}
              </div>
              {Array.from({ length: 24 }, (_, hour) => {
                const v = grid[dow]?.[hour] ?? 0
                const intensity = v / max
                return (
                  <div
                    key={`${dow}-${hour}`}
                    title={`${day} ${hour}:00 — ${v} joins`}
                    className="aspect-square rounded-[2px]"
                    style={{
                      backgroundColor:
                        v === 0
                          ? 'rgba(255,255,255,0.04)'
                          : `rgba(232, 121, 249, ${0.15 + intensity * 0.75})`,
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </StudioGlassCard>
  )
}
