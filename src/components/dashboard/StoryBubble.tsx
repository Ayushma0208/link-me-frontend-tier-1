'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Play } from 'lucide-react'

import type { StoryCreator } from '@/data/stories'
import { cn } from '@/lib/utils'

export interface StoryBubbleProps {
  creator: StoryCreator
  suggested?: boolean
  onClick?: () => void
  className?: string
}

export function StoryBubble({
  creator,
  suggested = false,
  onClick,
  className,
}: StoryBubbleProps) {
  const prefersReducedMotion = useReducedMotion()
  const unseen = !creator.seen
  const hasVideo = creator.stories.some((s) => s.type === 'video')

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -4, scale: 1.05, transition: { duration: 0.2 } }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      className={cn(
        'group flex w-[78px] shrink-0 flex-col items-center gap-2 outline-none',
        'focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070b]',
        className
      )}
      aria-label={
        suggested
          ? `Suggested story from ${creator.name}`
          : `View story from ${creator.name}`
      }
    >
      <span className="relative">
        <span
          aria-hidden
          className={cn(
            'absolute -inset-[3px] rounded-full',
            unseen
              ? cn(
                  'bg-[linear-gradient(135deg,#fbbf24,#ff4d9a,#a855f7,#38bdf8,#fbbf24)]',
                  'bg-[length:220%_220%]',
                  !prefersReducedMotion && 'animate-[gradient-shift_3.5s_ease_infinite]',
                  'opacity-100 shadow-[0_0_20px_rgba(255,77,154,0.4)]',
                  'transition-shadow duration-300 group-hover:shadow-[0_0_32px_rgba(168,85,247,0.55)]'
                )
              : 'bg-white/20'
          )}
        />
        <span
          className={cn(
            'relative block rounded-full bg-[#07070b] p-[2.5px]',
            'transition-transform duration-300 group-hover:scale-[1.02]'
          )}
        >
          <Image
            src={creator.avatar}
            alt=""
            width={64}
            height={64}
            className="size-14 rounded-full object-cover sm:size-[62px]"
            sizes="62px"
          />
          {hasVideo ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/15 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="size-4 fill-white text-white drop-shadow" />
            </span>
          ) : null}
        </span>

        {suggested ? (
          <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[11px] font-bold text-white ring-2 ring-[#07070b]">
            +
          </span>
        ) : null}
      </span>

      <span className="flex max-w-full items-center justify-center gap-0.5 px-0.5">
        <span
          className={cn(
            'truncate text-[11px] font-medium transition-colors group-hover:text-white',
            unseen ? 'text-white/80' : 'text-white/45'
          )}
        >
          {creator.handle}
        </span>
        {creator.verified ? (
          <BadgeCheck
            className="size-3 shrink-0 fill-sky-500 text-white"
            aria-hidden
          />
        ) : null}
      </span>
    </motion.button>
  )
}
