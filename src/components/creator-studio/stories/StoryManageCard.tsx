'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Clock, Eye, GripVertical, Play, Trash2 } from 'lucide-react'
import type { DragEvent } from 'react'

import { SafeImage } from '@/components/media/SafeImage'
import {
  hoursRemaining,
  isStoryActive,
  type StudioStory,
} from '@/data/creator-studio'
import { pickImageSrc } from '@/lib/media-url'
import { cn, formatFollowers } from '@/lib/utils'

export interface StoryManageCardProps {
  story: StudioStory
  draggable?: boolean
  onPreview?: () => void
  onDelete?: () => void
  onDragStart?: (e: DragEvent, story: StudioStory) => void
  delay?: number
  className?: string
}

export function StoryManageCard({
  story,
  draggable = false,
  onPreview,
  onDelete,
  onDragStart,
  delay = 0,
  className,
}: StoryManageCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const active = isStoryActive(story)
  const hrs = hoursRemaining(story)

  return (
    <motion.article
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]',
        'shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl',
        !active && 'opacity-80',
        className
      )}
    >
      <div
        draggable={draggable}
        onDragStart={(e) => onDragStart?.(e, story)}
        className={cn(draggable && 'cursor-grab active:cursor-grabbing')}
      >
      <button
        type="button"
        onClick={onPreview}
        className="relative block aspect-[9/16] w-full text-left"
      >
        <SafeImage
          src={
            story.type === 'video'
              ? pickImageSrc(story.mediaUrl)
              : story.mediaUrl
          }
          alt=""
          fill
          sizes="(max-width:768px) 50vw, 220px"
          className={cn(
            'object-cover transition duration-500 group-hover:scale-105',
            !active && 'grayscale-[0.35] brightness-75'
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/25" />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/85 uppercase backdrop-blur-md">
            {story.type}
          </span>
          {draggable ? (
            <span className="rounded-full border border-white/10 bg-black/40 p-1.5 text-white/50 backdrop-blur-md">
              <GripVertical className="size-3.5" />
            </span>
          ) : null}
        </div>

        {story.type === 'video' ? (
          <span className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md opacity-0 transition group-hover:opacity-100">
            <Play className="size-5 fill-white" />
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3.5">
          <p className="inline-flex items-center gap-1.5 text-[12px] text-white/75">
            <Eye className="size-3.5" />
            {formatFollowers(story.views)} views
          </p>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-white/45">
            <Clock className="size-3" />
            {active ? `${hrs}h left` : 'Expired'}
          </p>
        </div>
      </button>

      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete story"
          className="absolute top-3 right-3 z-10 rounded-full border border-white/10 bg-black/45 p-2 text-white/70 backdrop-blur-md transition hover:bg-rose-500/30 hover:text-white"
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}
      </div>
    </motion.article>
  )
}
