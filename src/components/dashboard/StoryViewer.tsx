'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, ChevronLeft, ChevronRight, X } from 'lucide-react'

import type { StoryCreator } from '@/data/stories'
import { imageSrcForDisplay } from '@/lib/media-url'
import { cn } from '@/lib/utils'

const DEFAULT_DURATION_MS = 5000

export interface StoryViewerProps {
  creators: StoryCreator[]
  initialCreatorIndex?: number
  open: boolean
  onClose: () => void
  onMarkSeen?: (creatorId: string) => void
}

export function StoryViewer({
  creators,
  initialCreatorIndex = 0,
  open,
  onClose,
  onMarkSeen,
}: StoryViewerProps) {
  const prefersReducedMotion = useReducedMotion()
  const [creatorIndex, setCreatorIndex] = useState(initialCreatorIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const frameRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const creator = creators[creatorIndex]
  const stories = creator?.stories ?? []
  const story = stories[storyIndex]
  const duration = story?.durationMs ?? DEFAULT_DURATION_MS

  useEffect(() => {
    if (!open) return
    setCreatorIndex(initialCreatorIndex)
    setStoryIndex(0)
    setProgress(0)
    setPaused(false)
  }, [open, initialCreatorIndex])

  useEffect(() => {
    if (!open || !creator) return
    onMarkSeen?.(creator.id)
  }, [open, creator, onMarkSeen])

  useEffect(() => {
    const video = videoRef.current
    if (!video || story?.type !== 'video') return
    if (paused) video.pause()
    else void video.play().catch(() => undefined)
  }, [paused, story])

  const goNext = useCallback(() => {
    if (!creator) return
    if (storyIndex < stories.length - 1) {
      setStoryIndex((i) => i + 1)
      setProgress(0)
      return
    }
    if (creatorIndex < creators.length - 1) {
      setCreatorIndex((i) => i + 1)
      setStoryIndex(0)
      setProgress(0)
      return
    }
    onClose()
  }, [creator, creatorIndex, creators.length, onClose, stories.length, storyIndex])

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1)
      setProgress(0)
      return
    }
    if (creatorIndex > 0) {
      const prevCreator = creators[creatorIndex - 1]
      setCreatorIndex((i) => i - 1)
      setStoryIndex(Math.max((prevCreator?.stories.length ?? 1) - 1, 0))
      setProgress(0)
    }
  }, [creatorIndex, creators, storyIndex])

  useEffect(() => {
    if (!open || !story || paused) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      lastTsRef.current = null
      return
    }

    let active = true
    const tick = (ts: number) => {
      if (!active) return
      if (lastTsRef.current == null) lastTsRef.current = ts
      const delta = ts - lastTsRef.current
      lastTsRef.current = ts
      setProgress((prev) => {
        const next = prev + delta / duration
        if (next >= 1) {
          queueMicrotask(() => goNext())
          return 1
        }
        return next
      })
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      active = false
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      lastTsRef.current = null
    }
  }, [open, story, paused, duration, goNext])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === ' ') {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, goNext, goPrev])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && creator && story ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Story from ${creator.name}`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close stories"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition hover:bg-white/15"
          >
            <X className="size-5" />
          </button>

          {creatorIndex > 0 || storyIndex > 0 ? (
            <button
              type="button"
              aria-label="Previous story"
              onClick={goPrev}
              className="absolute left-3 z-20 hidden rounded-full bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/15 sm:flex"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : null}

          {creatorIndex < creators.length - 1 ||
          storyIndex < stories.length - 1 ? (
            <button
              type="button"
              aria-label="Next story"
              onClick={goNext}
              className="absolute right-14 z-20 hidden rounded-full bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/15 sm:flex"
            >
              <ChevronRight className="size-5" />
            </button>
          ) : null}

          <motion.div
            key={`${creator.id}-${story.id}`}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full max-h-[100dvh] w-full max-w-md overflow-hidden bg-black sm:max-h-[90vh] sm:rounded-[28px] sm:shadow-[0_40px_100px_rgba(0,0,0,0.65)]"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
              {stories.map((item, i) => (
                <div
                  key={item.id}
                  className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/25"
                >
                  <div
                    className="h-full origin-left rounded-full bg-white"
                    style={{
                      transform: `scaleX(${
                        i < storyIndex ? 1 : i === storyIndex ? progress : 0
                      })`,
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
                className="size-9 rounded-full object-cover ring-2 ring-white/25"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-semibold text-white">
                  {creator.name}
                  {creator.verified ? (
                    <BadgeCheck
                      className="size-3.5 fill-sky-500 text-white"
                      aria-hidden
                    />
                  ) : null}
                </p>
                <p className="text-[11px] text-white/55">
                  @{creator.handle}
                  {story.type === 'video' ? ' · Video' : ''}
                </p>
              </div>
              {paused ? (
                <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/70 uppercase">
                  Paused
                </span>
              ) : null}
            </div>

            <div className="absolute inset-0">
              {story.type === 'video' ? (
                <video
                  key={story.id}
                  ref={videoRef}
                  src={story.mediaUrl}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                />
              ) : (
                <Image
                  src={imageSrcForDisplay(story.mediaUrl)}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:640px) 100vw, 420px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/35" />
            </div>

            <div className="absolute inset-0 z-[5] flex">
              <button
                type="button"
                aria-label="Previous"
                className="h-full w-1/3"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
              />
              <button
                type="button"
                aria-label="Next"
                className="h-full w-2/3"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
