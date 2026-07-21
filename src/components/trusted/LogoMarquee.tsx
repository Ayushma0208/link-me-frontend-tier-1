'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'

import type { PlatformLogo } from '@/data/trusted'
import { cn } from '@/lib/utils'

import { PlatformIcon } from './PlatformIcon'

export interface LogoMarqueeProps {
  logos: PlatformLogo[]
  /** `left` scrolls toward the start; `right` scrolls the opposite way */
  direction?: 'left' | 'right'
  /** Seconds for one full loop of the duplicated track */
  duration?: number
  /** Externally controlled pause (e.g. section hover) */
  paused?: boolean
  className?: string
}

function LogoItem({ logo }: { logo: PlatformLogo }) {
  return (
    <div
      className={cn(
        'group/logo flex shrink-0 items-center gap-2.5 px-5 sm:gap-3 sm:px-7',
        'text-white/40 transition-all duration-300 ease-out',
        'hover:scale-105 hover:text-white'
      )}
    >
      <PlatformIcon
        id={logo.id}
        className="size-5 transition-transform duration-300 group-hover/logo:scale-110 sm:size-[1.35rem]"
      />
      <span className="text-sm font-medium tracking-[-0.01em] sm:text-[15px]">
        {logo.name}
      </span>
    </div>
  )
}

/**
 * Infinite horizontal logo marquee with seamless looping and hover pause.
 */
export function LogoMarquee({
  logos,
  direction = 'left',
  duration = 40,
  paused: pausedProp,
  className,
}: LogoMarqueeProps) {
  const prefersReducedMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const paused = pausedProp ?? hovered
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const track = [...logos, ...logos]

  useEffect(() => {
    const node = trackRef.current
    if (!node) return

    const loopWidth = node.scrollWidth / 2
    x.set(direction === 'right' ? -loopWidth : 0)
  }, [direction, logos, x])

  useAnimationFrame((_, delta) => {
    if (paused || prefersReducedMotion) return

    const node = trackRef.current
    if (!node) return

    const loopWidth = node.scrollWidth / 2
    if (loopWidth <= 0) return

    const speed = loopWidth / (duration * 1000)
    let next = x.get() + speed * delta * (direction === 'left' ? -1 : 1)

    if (direction === 'left') {
      if (next <= -loopWidth) next += loopWidth
    } else if (next >= 0) {
      next -= loopWidth
    }

    x.set(next)
  })

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        'sm:[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]',
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div ref={trackRef} className="flex w-max items-center" style={{ x }}>
        {track.map((logo, index) => (
          <LogoItem key={`${logo.id}-${index}`} logo={logo} />
        ))}
      </motion.div>
    </div>
  )
}
