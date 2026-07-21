'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'

import { StoryRing } from '@/components/user/StoryRing'
import { SafeImage } from '@/components/media/SafeImage'
import {
  feedStories,
  type FeedCreator,
  type FeedStory,
} from '@/data/user-feed'
import { cn } from '@/lib/utils'

interface StoriesRailProps {
  creators: FeedCreator[]
  className?: string
}

export function StoriesRail({ creators, className }: StoriesRailProps) {
  const [activeCreatorId, setActiveCreatorId] = useState<string | null>(null)
  const [storyIndex, setStoryIndex] = useState(0)

  const activeStories = useMemo(
    () =>
      activeCreatorId
        ? feedStories.filter((story) => story.creatorId === activeCreatorId)
        : [],
    [activeCreatorId]
  )

  const activeCreator = creators.find((c) => c.id === activeCreatorId)

  const openStory = useCallback((creatorId: string) => {
    setActiveCreatorId(creatorId)
    setStoryIndex(0)
  }, [])

  const closeStory = useCallback(() => {
    setActiveCreatorId(null)
    setStoryIndex(0)
  }, [])

  const nextStory = useCallback(() => {
    setStoryIndex((current) => {
      const stories = activeCreatorId
        ? feedStories.filter((story) => story.creatorId === activeCreatorId)
        : []
      if (current < stories.length - 1) return current + 1

      const currentIdx = creators.findIndex((c) => c.id === activeCreatorId)
      const next = creators[currentIdx + 1]
      if (next) {
        queueMicrotask(() => openStory(next.id))
      } else {
        queueMicrotask(() => closeStory())
      }
      return current
    })
  }, [activeCreatorId, closeStory, creators, openStory])

  return (
    <>
      <div className={cn('relative', className)}>
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {creators.map((creator) => (
            <StoryRing
              key={creator.id}
              creator={creator}
              seen={creator.storySeen}
              onClick={() => openStory(creator.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeCreator && activeStories[storyIndex] ? (
          <StoryOverlay
            key={`${activeCreator.id}-${activeStories[storyIndex]!.id}`}
            creator={activeCreator}
            story={activeStories[storyIndex]!}
            index={storyIndex}
            total={activeStories.length}
            onClose={closeStory}
            onNext={nextStory}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

interface StoryOverlayProps {
  creator: FeedCreator
  story: FeedStory
  index: number
  total: number
  onClose: () => void
  onNext: () => void
}

function StoryOverlay({
  creator,
  story,
  index,
  total,
  onClose,
  onNext,
}: StoryOverlayProps) {
  useEffect(() => {
    const timer = window.setTimeout(onNext, 4500)
    return () => window.clearTimeout(timer)
  }, [story.id, onNext])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Close story"
        onClick={onClose}
        className="absolute top-5 right-5 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/15"
      >
        <X className="size-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full max-h-[88vh] w-full max-w-md overflow-hidden rounded-[28px] bg-black"
        onClick={onNext}
      >
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <motion.div
                className="h-full bg-white"
                initial={{ width: i < index ? '100%' : '0%' }}
                animate={{ width: i <= index ? '100%' : '0%' }}
                transition={{
                  duration: i === index ? 4.5 : 0,
                  ease: 'linear',
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 top-8 z-10 flex items-center gap-3 px-4">
        <Image
          src={creator.avatar}
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full object-cover ring-2 ring-white/30"
        />
          <div>
            <p className="text-sm font-semibold text-white">{creator.name}</p>
            <p className="text-[11px] text-white/55">@{creator.handle}</p>
          </div>
        </div>

        {story.type === 'video' ? (
          <video
            src={story.mediaUrl}
            className="absolute inset-0 size-full object-cover"
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <SafeImage
            src={story.mediaUrl}
            alt=""
            fill
            className="object-cover"
            sizes="420px"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40" />
      </motion.div>
    </motion.div>
  )
}
