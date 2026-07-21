'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { StoryBubble } from '@/components/dashboard/StoryBubble'
import { StoryViewer } from '@/components/dashboard/StoryViewer'
import type { StoryCreator, StoryItem } from '@/data/stories'
import { useStoriesFeed } from '@/lib/hooks/use-shared-queries'
import { cn } from '@/lib/utils'

const DEFAULT_AVATAR = 'https://picsum.photos/id/64/200/200'

interface ApiStory {
  id: string
  mediaType: string
  mediaUrl: string | null
  thumbnailUrl?: string | null
  caption?: string | null
}

interface ApiStoryRailCreator {
  id: string
  name: string
  handle: string
  avatar: string | null
  verified: boolean
  stories: ApiStory[]
}

function mapApiStory(story: ApiStory): StoryItem | null {
  const isVideo = story.mediaType === 'VIDEO' || story.mediaType === 'video'
  const url = isVideo
    ? story.mediaUrl || story.thumbnailUrl
    : story.mediaUrl || story.thumbnailUrl
  if (!url) return null
  return {
    id: story.id,
    mediaUrl: url,
    type: isVideo ? 'video' : 'image',
    durationMs: isVideo ? 8000 : 5000,
  }
}

function mapRailCreator(row: ApiStoryRailCreator): StoryCreator | null {
  const stories = row.stories.map(mapApiStory).filter(Boolean) as StoryItem[]
  if (!stories.length) return null
  return {
    id: row.id,
    name: row.name,
    handle: row.handle.replace(/^@/, '').toLowerCase(),
    avatar: row.avatar || DEFAULT_AVATAR,
    verified: row.verified,
    seen: false,
    stories,
  }
}

export interface StoriesProps {
  following?: StoryCreator[]
  suggested?: StoryCreator[]
  className?: string
}

export function Stories({
  following,
  suggested = [],
  className,
}: StoriesProps) {
  const prefersReducedMotion = useReducedMotion()
  const { data: feedItems, isLoading } = useStoriesFeed()
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set())
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const creators = useMemo(() => {
    if (following) return following
    const mapped = ((feedItems as ApiStoryRailCreator[] | undefined) ?? [])
      .map(mapRailCreator)
      .filter(Boolean) as StoryCreator[]
    return mapped.map((c) =>
      seenIds.has(c.id) ? { ...c, seen: true } : c
    )
  }, [following, feedItems, seenIds])

  const loading = !following && isLoading

  const isSuggested = creators.length === 0 && suggested.length > 0
  const rail = useMemo(
    () => (isSuggested ? suggested : creators),
    [creators, isSuggested, suggested]
  )

  const openViewer = useCallback((index: number) => {
    setActiveIndex(index)
    setViewerOpen(true)
  }, [])

  const markSeen = useCallback((creatorId: string) => {
    setSeenIds((prev) => new Set(prev).add(creatorId))
  }, [])

  if (loading) {
    return (
      <section className={cn('w-full', className)} aria-label="Stories">
        <p className="text-[13px] text-white/35">Loading stories…</p>
      </section>
    )
  }

  if (rail.length === 0) {
    return (
      <section className={cn('w-full', className)} aria-label="Stories">
        <div className="mb-1">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            Stories
          </p>
          <p className="mt-1 text-[13px] text-white/40">
            Stories from creators you follow or subscribe to will show here.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('w-full', className)} aria-label="Stories">
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            Stories
          </p>
          <p className="mt-1 text-[13px] text-white/40">
            From creators you follow or subscribe to
          </p>
        </div>
      </div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'relative -mx-1 rounded-[24px] border border-white/[0.06] bg-white/[0.03] px-2 py-3',
          'backdrop-blur-sm sm:px-3',
          'before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-5 before:rounded-l-[24px] before:bg-gradient-to-r before:from-[#0c0c12] before:to-transparent',
          'after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-5 after:rounded-r-[24px] after:bg-gradient-to-l after:from-[#0c0c12] after:to-transparent'
        )}
      >
        <div
          className={cn(
            'flex gap-3.5 overflow-x-auto px-2 py-1',
            '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            'snap-x snap-mandatory'
          )}
        >
          {rail.map((creator, index) => (
            <motion.div
              key={creator.id}
              className="snap-start"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.35,
                delay: index * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <StoryBubble
                creator={creator}
                suggested={isSuggested}
                onClick={() => openViewer(index)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <StoryViewer
        open={viewerOpen}
        creators={rail}
        initialCreatorIndex={activeIndex}
        onClose={() => setViewerOpen(false)}
        onMarkSeen={isSuggested ? undefined : markSeen}
      />
    </section>
  )
}
