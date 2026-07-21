'use client'

import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

import type { AppItem } from '@/data/apps'
import { cn } from '@/lib/utils'

import { AppIcon } from './AppIcon'

export interface AppsMarqueeProps {
  apps: AppItem[]
  direction?: 'left' | 'right'
  /** Loop duration in seconds */
  duration?: number
  /** Horizontal start offset for staggered rows */
  offsetClassName?: string
  className?: string
}

/**
 * Infinite CSS-driven icon marquee. Pauses while the row is hovered/focused.
 */
export function AppsMarquee({
  apps,
  direction = 'left',
  duration = 40,
  offsetClassName,
  className,
}: AppsMarqueeProps) {
  const prefersReducedMotion = useReducedMotion()
  const track = useMemo(() => [...apps, ...apps], [apps])

  const durationClass =
    duration <= 32
      ? '[--apps-marquee-duration:32s]'
      : duration <= 38
        ? '[--apps-marquee-duration:38s]'
        : duration <= 44
          ? '[--apps-marquee-duration:44s]'
          : '[--apps-marquee-duration:50s]'

  return (
    <div
      className={cn(
        'group/apps-row relative w-full overflow-hidden py-1',
        className
      )}
    >
      <div
        className={cn(
          'flex w-max items-center gap-3 sm:gap-4 lg:gap-5',
          durationClass,
          offsetClassName,
          !prefersReducedMotion &&
            (direction === 'left' ? 'animate-apps-marquee' : 'animate-apps-marquee-reverse'),
          'group-hover/apps-row:[animation-play-state:paused]',
          'group-focus-within/apps-row:[animation-play-state:paused]',
          'motion-reduce:animate-none'
        )}
      >
        {track.map((app, index) => (
          <AppIcon key={`${app.id}-${index}`} app={app} />
        ))}
      </div>
    </div>
  )
}
