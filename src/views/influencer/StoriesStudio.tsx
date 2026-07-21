'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Clock, Eye, Trash2 } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { StoryThumb, StoryUploadRing } from '@/components/creator-studio/StoryUpload'
import { studioStories } from '@/data/creator-studio'
import { formatFollowers } from '@/lib/utils'

export function StoriesStudio() {
  const prefersReducedMotion = useReducedMotion()
  const [toast, setToast] = useState('')

  function handleUpload() {
    setToast('Story picker ready — connect media upload to go live.')
    window.setTimeout(() => setToast(''), 2800)
  }

  return (
    <div>
      <StudioPageHeader
        title="Stories"
        description="Instagram-style stories that disappear in 24 hours. Keep your audience close."
      />

      <StudioGlassCard glow="creator" className="mb-8 p-5 sm:p-6">
        <div className="flex items-center gap-5 overflow-x-auto pb-2">
          <StoryUploadRing onUpload={handleUpload} />
          {studioStories.map((story, index) => (
            <StoryThumb key={story.id} story={story} delay={index * 0.06} />
          ))}
        </div>
        {toast ? (
          <p className="mt-3 text-[13px] text-fuchsia-200/90">{toast}</p>
        ) : (
          <p className="mt-3 text-[13px] text-white/40">
            Tap Add story to upload an image or short video.
          </p>
        )}
      </StudioGlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studioStories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <StudioGlassCard className="overflow-hidden p-0">
              <div className="relative aspect-[9/16] max-h-[420px]">
                <Image
                  src={story.mediaUrl}
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-md">
                    {story.type}
                  </span>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-black/40 p-2 text-white/70 backdrop-blur-md hover:text-white"
                    aria-label="Delete story"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-4">
                  <p className="inline-flex items-center gap-1.5 text-[12px] text-white/70">
                    <Eye className="size-3.5" />
                    {formatFollowers(story.views)} views
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-white/45">
                    <Clock className="size-3" />
                    Expires {new Date(story.expiresAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </StudioGlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
