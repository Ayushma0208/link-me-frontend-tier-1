'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

import type { PublicCreator } from '@/data/public-creator'
import { cn } from '@/lib/utils'

export interface ProfileStoriesProps {
  creator: PublicCreator
  seen?: boolean
  onOpen: () => void
  className?: string
}

export function ProfileStories({
  creator,
  seen = false,
  onOpen,
  className,
}: ProfileStoriesProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!creator.stories.length) return null

  return (
    <section className={cn('space-y-3', className)} aria-label="Stories">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
          Stories
        </p>
        <span className="text-[11px] text-white/35">
          {creator.stories.length} active
        </span>
      </div>

      <motion.button
        type="button"
        onClick={onOpen}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.03 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        className="group flex w-max max-w-full items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-2.5 pr-5 text-left backdrop-blur-xl transition hover:border-white/18 hover:bg-white/[0.07]"
      >
        <span
          className={cn(
            'rounded-full p-[2.5px]',
            seen
              ? 'bg-white/25'
              : cn(
                  'bg-[linear-gradient(135deg,#ffb03a,#ff4d9a,#a855f7,#38bdf8,#ffb03a)]',
                  'bg-[length:220%_220%] animate-[gradient-shift_3.5s_ease_infinite]',
                  'shadow-[0_0_24px_rgba(255,77,154,0.35)]'
                )
          )}
        >
          <span className="relative block rounded-full bg-black p-[2.5px]">
            <span className="relative block size-14 overflow-hidden rounded-full sm:size-16">
              <Image
                src={creator.avatar}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="64px"
              />
            </span>
          </span>
        </span>

        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-white">
            {creator.name}
          </p>
          <p className="mt-0.5 text-[12px] text-white/45">
            {seen ? 'Viewed' : 'Tap to view'} · {creator.stories.length} slides
          </p>
        </div>
      </motion.button>
    </section>
  )
}
