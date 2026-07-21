'use client'

import { CalendarClock } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface SchedulePostProps {
  enabled: boolean
  onEnabledChange: (value: boolean) => void
  datetime: string
  onDatetimeChange: (value: string) => void
  className?: string
}

export function SchedulePost({
  enabled,
  onEnabledChange,
  datetime,
  onDatetimeChange,
  className,
}: SchedulePostProps) {
  return (
    <div
      className={cn(
        'space-y-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-4',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onEnabledChange(!enabled)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-fuchsia-200">
            <CalendarClock className="size-4" />
          </span>
          <span>
            <span className="block text-[14px] font-semibold text-white">
              Schedule post
            </span>
            <span className="block text-[12px] text-white/40">
              Publish later at a set time
            </span>
          </span>
        </span>
        <span
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors',
            enabled ? 'bg-fuchsia-500' : 'bg-white/15'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
              enabled ? 'left-[22px]' : 'left-0.5'
            )}
          />
        </span>
      </button>

      {enabled ? (
        <label className="block space-y-2">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            Publish at
          </span>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => onDatetimeChange(e.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-[13px] text-white outline-none focus:border-fuchsia-400/35 [color-scheme:dark]"
          />
        </label>
      ) : null}
    </div>
  )
}
