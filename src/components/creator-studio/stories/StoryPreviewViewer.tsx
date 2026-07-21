'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, ChevronLeft, ChevronRight, X } from 'lucide-react'

import type { StudioStory } from '@/data/creator-studio'
import { cn } from '@/lib/utils'

export interface StoryPreviewCreator {
  displayName: string
  username: string
  avatarUrl?: string | null
  isVerified?: boolean
}

export interface StoryPreviewViewerProps {
  stories: StudioStory[]
  initialIndex?: number
  open: boolean
  onClose: () => void
  creator?: StoryPreviewCreator | null
}

const FALLBACK_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=Creator'

export function StoryPreviewViewer({
  stories,
  initialIndex = 0,
  open,
  onClose,
  creator,
}: StoryPreviewViewerProps) {
  const prefersReducedMotion = useReducedMotion()
  const [index, setIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)

  const story = stories[index]
  const displayName = creator?.displayName || 'Creator'
  const username = creator?.username || 'creator'
  const avatar = creator?.avatarUrl || FALLBACK_AVATAR
  const isVerified = Boolean(creator?.isVerified)

  useEffect(() => {
    if (!open) return
    setIndex(initialIndex)
    setProgress(0)
  }, [open, initialIndex])

  useEffect(() => {
    if (!open || !story) return
    setProgress(0)
    const start = performance.now()
    const duration = story.type === 'video' ? 8000 : 5000
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setProgress(p)
      if (p >= 1) {
        if (index < stories.length - 1) setIndex((i) => i + 1)
        else onClose()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open, story, index, stories.length, onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && index < stories.length - 1)
        setIndex((i) => i + 1)
      if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, index, stories.length])

  return (
    <AnimatePresence>
      {open && story ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            onClick={onClose}
          />

          <motion.div
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative z-10 flex h-[min(860px,92dvh)] w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] border border-white/12 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.7)]"
          >
            <div className="absolute inset-x-0 top-0 z-20 space-y-3 p-3">
              <div className="flex gap-1">
                {stories.map((s, i) => (
                  <div
                    key={s.id}
                    className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25"
                  >
                    <div
                      className="h-full rounded-full bg-white"
                      style={{
                        width:
                          i < index
                            ? '100%'
                            : i === index
                              ? `${progress * 100}%`
                              : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative size-9 overflow-hidden rounded-full ring-2 ring-white/20">
                  <Image
                    src={avatar}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover"
                    unoptimized={
                      avatar.includes('dicebear') || avatar.startsWith('data:')
                    }
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-[13px] font-semibold text-white">
                    {displayName}
                    {isVerified ? (
                      <BadgeCheck className="size-3.5 fill-sky-500 text-white" />
                    ) : null}
                  </p>
                  <p className="text-[11px] text-white/50">
                    @{username} · Preview
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/15 bg-black/40 p-2 text-white/80"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1">
              {story.type === 'video' ? (
                <video
                  key={story.id}
                  src={story.mediaUrl}
                  className="size-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                />
              ) : (
                <Image
                  key={story.id}
                  src={story.mediaUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="420px"
                  priority
                />
              )}
              <button
                type="button"
                aria-label="Previous"
                className="absolute inset-y-0 left-0 w-1/3"
                onClick={() => index > 0 && setIndex((i) => i - 1)}
              />
              <button
                type="button"
                aria-label="Next"
                className="absolute inset-y-0 right-0 w-1/3"
                onClick={() => {
                  if (index < stories.length - 1) setIndex((i) => i + 1)
                  else onClose()
                }}
              />
            </div>

            <div className="absolute inset-x-0 bottom-4 z-20 flex justify-between px-3">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md',
                  index === 0 && 'opacity-30'
                )}
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (index < stories.length - 1) setIndex((i) => i + 1)
                  else onClose()
                }}
                className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
