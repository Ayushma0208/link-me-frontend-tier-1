'use client'

import { Plus, Play } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { SafeImage } from '@/components/media/SafeImage'
import type { StudioStory } from '@/data/creator-studio'
import { pickImageSrc } from '@/lib/media-url'
import { formatFollowers } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StoryUploadRingProps {
  onUpload?: () => void
  className?: string
}

export function StoryUploadRing({ onUpload, className }: StoryUploadRingProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onUpload}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      className={cn('flex flex-col items-center gap-2', className)}
    >
      <div className="flex size-[76px] items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-[2.5px]">
        <div className="flex size-full items-center justify-center rounded-full bg-[#0a0a0f]">
          <div className="flex size-14 items-center justify-center rounded-full border border-dashed border-white/25 bg-white/[0.04]">
            <Plus className="size-6 text-white/80" />
          </div>
        </div>
      </div>
      <span className="text-[12px] font-medium text-white/60">Add story</span>
    </motion.button>
  )
}

interface StoryThumbProps {
  story: StudioStory
  delay?: number
}

export function StoryThumb({ story, delay = 0 }: StoryThumbProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative size-[76px] overflow-hidden rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-[2.5px]">
        <div className="relative size-full overflow-hidden rounded-full bg-[#0a0a0f] p-[2px]">
          <div className="relative size-full overflow-hidden rounded-full">
            <SafeImage
              src={
                story.type === 'video'
                  ? pickImageSrc(story.mediaUrl)
                  : story.mediaUrl
              }
              alt=""
              fill
              sizes="76px"
              className="object-cover"
            />
            {story.type === 'video' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Play className="size-4 fill-white text-white" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <span className="text-[11px] text-white/45">
        {formatFollowers(story.views)} views
      </span>
    </motion.div>
  )
}
