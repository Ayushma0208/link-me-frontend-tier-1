'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'

import type { FeedCreator } from '@/data/user-feed'
import { cn } from '@/lib/utils'

interface StoryRingProps {
  creator: FeedCreator
  seen?: boolean
  onClick?: () => void
  className?: string
}

export function StoryRing({ creator, seen = false, onClick, className }: StoryRingProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.03 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      className={cn('flex w-[76px] shrink-0 flex-col items-center gap-2', className)}
    >
      <span
        className={cn(
          'rounded-full p-[2.5px]',
          seen
            ? 'bg-white/20'
            : 'bg-gradient-to-br from-amber-300 via-fuchsia-500 to-violet-600'
        )}
      >
        <span className="block rounded-full bg-surface p-[2px]">
          <Image
            src={creator.avatar}
            alt=""
            width={64}
            height={64}
            className="size-14 rounded-full object-cover"
          />
        </span>
      </span>
      <span className="flex max-w-full items-center gap-0.5 truncate text-[11px] text-white/70">
        <span className="truncate">{creator.handle}</span>
        {creator.verified ? (
          <BadgeCheck className="size-3 shrink-0 fill-sky-500 text-white" aria-hidden />
        ) : null}
      </span>
    </motion.button>
  )
}
