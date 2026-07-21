'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'

import type { StudioHighlight } from '@/data/creator-studio'
import { cn } from '@/lib/utils'

export interface HighlightManageCardProps {
  highlight: StudioHighlight
  onEdit: () => void
  onDelete: () => void
  onDropStory: (storyId: string) => void
  delay?: number
  className?: string
}

export function HighlightManageCard({
  highlight,
  onEdit,
  onDelete,
  onDropStory,
  delay = 0,
  className,
}: HighlightManageCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/story-id')
        if (id) onDropStory(id)
      }}
      className={cn(
        'rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl',
        'shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition hover:border-fuchsia-400/25',
        className
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative size-24 overflow-hidden rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-[2.5px]">
          <div className="relative size-full overflow-hidden rounded-full bg-[#0a0a10] p-[2px]">
            <div className="relative size-full overflow-hidden rounded-full">
              <Image
                src={highlight.cover}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-[14px] font-semibold text-white">
          {highlight.title}
        </p>
        <p className="mt-1 text-[12px] text-white/40">
          {highlight.storyIds.length || highlight.storyCount} stories
        </p>
        <p className="mt-2 text-[10px] tracking-wide text-white/30 uppercase">
          Drop stories here
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] text-[12px] font-semibold text-white/80 hover:text-white"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${highlight.title}`}
          className="inline-flex size-9 items-center justify-center rounded-full border border-rose-400/20 bg-rose-500/10 text-rose-200"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
