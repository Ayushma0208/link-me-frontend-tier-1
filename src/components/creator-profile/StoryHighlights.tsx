'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, Lock } from 'lucide-react'

import type { PublicHighlight } from '@/data/public-creator'
import { cn } from '@/lib/utils'

export interface StoryHighlightsProps {
  highlights: PublicHighlight[]
  /** Subscribers and owners see premium highlights unlocked. */
  premiumUnlocked?: boolean
  onSelect?: (highlight: PublicHighlight, index: number) => void
  onLockedClick?: () => void
  className?: string
}

export function StoryHighlights({
  highlights,
  premiumUnlocked = false,
  onSelect,
  onLockedClick,
  className,
}: StoryHighlightsProps) {
  const prefersReducedMotion = useReducedMotion()
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    function update() {
      if (!el) return
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [highlights.length])

  if (!highlights.length) return null

  function scrollNext() {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.7, behavior: 'smooth' })
  }

  return (
    <section
      className={cn('relative', className)}
      aria-label="Story highlights"
    >
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto px-0.5 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
      >
        {highlights.map((highlight, index) => {
          const locked = Boolean(highlight.premium) && !premiumUnlocked
          return (
            <motion.button
              key={highlight.id}
              type="button"
              onClick={() =>
                locked ? onLockedClick?.() : onSelect?.(highlight, index)
              }
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              className="group flex w-[72px] shrink-0 flex-col items-center gap-2 sm:w-[78px]"
            >
              {/* Instagram-style thin ring */}
              <span
                className={cn(
                  'rounded-full p-[2px]',
                  locked ? 'bg-white/20' : 'bg-[#363636]'
                )}
              >
                <span className="relative block rounded-full bg-black p-[3px]">
                  <span className="relative block size-[64px] overflow-hidden rounded-full sm:size-[70px]">
                    <Image
                      src={highlight.coverUrl}
                      alt=""
                      fill
                      className={cn(
                        'object-cover',
                        locked && 'blur-[1.5px] brightness-75'
                      )}
                      sizes="70px"
                    />
                    {locked ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Lock className="size-3.5 text-white" aria-hidden />
                      </span>
                    ) : null}
                  </span>
                </span>
              </span>
              <span className="max-w-full truncate text-center text-[12px] leading-none text-white">
                {highlight.title}
              </span>
            </motion.button>
          )
        })}
      </div>

      {canScrollRight ? (
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Scroll highlights"
          className="absolute top-[28px] right-0 z-10 flex size-7 items-center justify-center rounded-full bg-white text-black shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:top-[32px] sm:size-8"
        >
          <ChevronRight className="size-4" strokeWidth={2.5} aria-hidden />
        </button>
      ) : null}
    </section>
  )
}
