'use client'

import { useState } from 'react'
import { ChevronDown, Video } from 'lucide-react'

import { cn, formatCurrency } from '@/lib/utils'
import type { ProfileAppearance } from '@/lib/profile-appearance'

interface ExclusiveVideoCallCardProps {
  creatorName: string
  pricePerMinute: number
  appearance: ProfileAppearance
  onBook: () => void
}

export function ExclusiveVideoCallCard({
  creatorName,
  pricePerMinute,
  appearance,
  onBook,
}: ExclusiveVideoCallCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLight = appearance.theme === 'light'

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[24px] border',
        isLight
          ? 'border-black/8 bg-white text-zinc-900 shadow-sm'
          : 'border-white/10 bg-white/[0.04] text-white'
      )}
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${appearance.accent}22` }}
        >
          <Video
            className="size-6"
            style={{ color: appearance.accent }}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.16em] opacity-45 uppercase">
            Exclusive experience
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight">
            Private video call with {creatorName}
          </h2>
          <p
            className={cn(
              'mt-2 text-sm leading-relaxed',
              isLight ? 'text-zinc-500' : 'text-white/55',
              !expanded && 'line-clamp-2'
            )}
          >
            Connect one-to-one on a private video call. Ask questions, get
            personal advice, or simply spend exclusive time together. Calls are
            billed by the minute and can be ended at any time.
          </p>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: appearance.accent }}
          >
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                expanded && 'rotate-180'
              )}
            />
            {expanded ? 'Show Less' : 'Read Full Description'}
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <button
          type="button"
          onClick={onBook}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: appearance.accent }}
        >
          <Video className="size-4" aria-hidden />
          Start video call · {formatCurrency(pricePerMinute)}/min
        </button>
      </div>
    </section>
  )
}
