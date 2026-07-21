'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface StoryHighlight {
  id: string
  title: string
  coverUrl: string
}

export interface StoryHighlightsProps {
  highlights: StoryHighlight[]
  onSelect?: (highlight: StoryHighlight, index: number) => void
  className?: string
}

export function StoryHighlights({
  highlights,
  onSelect,
  className,
}: StoryHighlightsProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!highlights.length) return null

  return (
    <section className={cn('space-y-3', className)} aria-label="Story highlights">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
        Highlights
      </p>

      <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {highlights.map((highlight, index) => (
          <motion.button
            key={highlight.id}
            type="button"
            onClick={() => onSelect?.(highlight, index)}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.04 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            className="group flex w-[76px] shrink-0 flex-col items-center gap-2"
          >
            <span className="rounded-full bg-gradient-to-br from-white/40 via-fuchsia-400/50 to-violet-500 p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-shadow group-hover:shadow-[0_0_28px_rgba(236,72,153,0.35)]">
              <span className="block rounded-full bg-[#07070b] p-[2.5px]">
                <span className="relative block size-14 overflow-hidden rounded-full sm:size-[60px]">
                  <Image
                    src={highlight.coverUrl}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="60px"
                  />
                </span>
              </span>
            </span>
            <span className="max-w-full truncate text-[11px] font-medium text-white/55 group-hover:text-white/80">
              {highlight.title}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

/** Dummy highlights derived from a creator id for demo profiles. */
export function buildCreatorHighlights(creatorId: string): StoryHighlight[] {
  const seed = Number(creatorId) || 1
  const titles = ['BTS', 'Drops', 'Live', 'Travel', 'Tips', 'Members']
  return titles.map((title, index) => ({
    id: `hl-${creatorId}-${index}`,
    title,
    coverUrl: `https://picsum.photos/id/${160 + seed * 3 + index}/200/200`,
  }))
}
