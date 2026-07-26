'use client'

import { AudioLines } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveNoiseControlsProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  overloaded?: boolean
  className?: string
}

export function LiveNoiseControls({
  enabled,
  onEnabledChange,
  overloaded = false,
  className,
}: LiveNoiseControlsProps) {
  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => onEnabledChange(!enabled)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition',
          enabled
            ? 'border-white bg-white text-black'
            : 'border-transparent bg-white/10 text-white hover:bg-white/20'
        )}
        title={
          overloaded
            ? 'Noise suppression overloaded — turned off'
            : 'AI noise suppression'
        }
        aria-pressed={enabled}
      >
        <AudioLines className="size-4" />
        Noise
      </button>
      {overloaded && !enabled ? (
        <p className="absolute right-0 top-[calc(100%+6px)] z-[60] w-max max-w-[12rem] rounded-lg border border-amber-400/30 bg-[#12121a]/95 px-2.5 py-1.5 text-[10px] leading-snug text-amber-100/90 shadow-lg backdrop-blur-md">
          Device overloaded — noise off
        </p>
      ) : null}
    </div>
  )
}
