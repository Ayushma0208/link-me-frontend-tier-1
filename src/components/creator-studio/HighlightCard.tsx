'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import type { StudioHighlight } from '@/data/creator-studio'
import { cn } from '@/lib/utils'

interface HighlightCardProps {
  highlight: StudioHighlight
  delay?: number
  className?: string
}

export function HighlightCard({ highlight, delay = 0, className }: HighlightCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      className={className}
    >
      <StudioGlassCard className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative size-24 overflow-hidden rounded-full border-2 border-white/15 p-1">
            <div className="relative size-full overflow-hidden rounded-full">
              <Image
                src={highlight.cover}
                alt={highlight.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </div>
          <p className="mt-3 text-[14px] font-semibold text-white">{highlight.title}</p>
          <p className="mt-1 text-[12px] text-white/40">
            {highlight.storyIds?.length ?? highlight.storyCount} stories
          </p>
        </div>
      </StudioGlassCard>
    </motion.div>
  )
}

export function NewHighlightButton({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-3',
        'rounded-[24px] border border-dashed border-white/15 bg-white/[0.03]',
        'text-white/50 transition-colors hover:border-fuchsia-400/35 hover:text-white',
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
        <Plus className="size-6" />
      </div>
      <span className="text-[13px] font-medium">New highlight</span>
    </button>
  )
}
