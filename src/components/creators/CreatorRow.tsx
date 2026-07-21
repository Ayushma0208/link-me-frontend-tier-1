'use client'

import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

import type { Creator } from '@/data/creators'
import { cn } from '@/lib/utils'

import { CreatorCard } from './CreatorCard'

export interface CreatorRowProps {
  creators: Creator[]
  direction?: 'left' | 'right'
  /** Full loop duration in seconds */
  duration?: number
  className?: string
}

/**
 * Infinite horizontal creator track.
 * CSS transform animation — no per-frame React updates.
 */
export function CreatorRow({
  creators,
  direction = 'left',
  duration = 40,
  className,
}: CreatorRowProps) {
  const prefersReducedMotion = useReducedMotion()
  const track = useMemo(() => [...creators, ...creators], [creators])

  return (
    <div className={cn('group/row relative w-full overflow-hidden', className)}>
      <div
        className={cn(
          'flex w-max gap-4 py-1 sm:gap-5',
          duration === 45
            ? '[--creator-marquee-duration:45s]'
            : '[--creator-marquee-duration:40s]',
          !prefersReducedMotion &&
            (direction === 'left'
              ? 'animate-creator-marquee'
              : 'animate-creator-marquee-reverse'),
          'group-hover/row:[animation-play-state:paused]',
          'motion-reduce:animate-none'
        )}
      >
        {track.map((creator, index) => (
          <CreatorCard key={`${creator.id}-${index}`} creator={creator} />
        ))}
      </div>
    </div>
  )
}
