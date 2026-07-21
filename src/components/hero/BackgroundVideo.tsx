'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface BackgroundVideoProps {
  videos: string[]
  /**
   * Controlled scene index. When set, the playlist syncs to this index
   * (Hero owns the 8s timer). Videos loop while visible.
   */
  activeIndex?: number
  overlayOpacity?: number
  className?: string
}

const CROSSFADE_MS = 500
const DEBUG =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

function log(...args: unknown[]) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.debug('[BackgroundVideo]', ...args)
  }
}

async function ensurePlay(video: HTMLVideoElement | null, label: string) {
  if (!video) return false

  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
  video.setAttribute('muted', '')

  try {
    const promise = video.play()
    if (promise !== undefined) await promise
    log(`${label} play() ok`, {
      src: video.currentSrc || video.src,
      readyState: video.readyState,
      paused: video.paused,
    })
    return true
  } catch (error) {
    log(`${label} play() blocked — will retry`, error)
    return false
  }
}

/**
 * Full-bleed hero playlist with two stable video slots.
 * Supports controlled `activeIndex` for synced Hero scenes.
 */
export function BackgroundVideo({
  videos,
  activeIndex,
  overlayOpacity = 0.5,
  className,
}: BackgroundVideoProps) {
  const prefersReducedMotion = useReducedMotion()
  const sources = useMemo(() => videos.filter(Boolean), [videos])
  const controlled = typeof activeIndex === 'number'

  const [indices, setIndices] = useState<[number, number]>([0, 1])
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0)
  const [opacity, setOpacity] = useState<[number, number]>([1, 0])

  const slotARef = useRef<HTMLVideoElement | null>(null)
  const slotBRef = useRef<HTMLVideoElement | null>(null)
  const fadingRef = useRef(false)
  const fadeTimerRef = useRef<number | null>(null)
  const activeSlotRef = useRef<0 | 1>(0)
  const displayedIndexRef = useRef(0)

  const count = sources.length

  const getRef = useCallback((slot: 0 | 1) => (slot === 0 ? slotARef : slotBRef), [])

  const clearFadeTimer = useCallback(() => {
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
  }, [])

  const crossfadeToIndex = useCallback(
    async (targetIndex: number) => {
      if (count === 0) return
      const normalized = ((targetIndex % count) + count) % count
      if (normalized === displayedIndexRef.current && !fadingRef.current) {
        // Still ensure the active clip is playing.
        void ensurePlay(getRef(activeSlotRef.current).current, 'resync')
        return
      }
      if (fadingRef.current) return

      const currentActive = activeSlotRef.current
      const nextSlot = (currentActive === 0 ? 1 : 0) as 0 | 1

      fadingRef.current = true

      // Point inactive slot at the target clip, then play + fade after paint.
      setIndices((prev) => {
        const next: [number, number] = [...prev]
        next[nextSlot] = normalized
        return next
      })

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve())
        })
      })

      const nextEl = getRef(nextSlot).current
      if (nextEl) {
        nextEl.load()
        await ensurePlay(nextEl, `slot-${nextSlot}-target`)
      }

      setOpacity(() => {
        const next: [number, number] = [0, 0]
        next[currentActive] = 0
        next[nextSlot] = 1
        return next
      })

      clearFadeTimer()
      fadeTimerRef.current = window.setTimeout(() => {
        const finishedSlot = currentActive

        setActiveSlot(nextSlot)
        activeSlotRef.current = nextSlot
        displayedIndexRef.current = normalized

        setOpacity(() => {
          const next: [number, number] = [0, 0]
          next[finishedSlot] = 0
          next[nextSlot] = 1
          return next
        })

        // Preload the following clip into the hidden slot.
        const following = (normalized + 1) % count
        setIndices((prev) => {
          const next: [number, number] = [...prev]
          next[finishedSlot] = following
          return next
        })

        const finishedEl = getRef(finishedSlot).current
        if (finishedEl) {
          finishedEl.pause()
          try {
            finishedEl.currentTime = 0
          } catch {
            /* ignore */
          }
        }

        fadingRef.current = false
        log('synced to index', normalized)
      }, CROSSFADE_MS)
    },
    [clearFadeTimer, count, getRef, sources]
  )

  // Initialize / reset when playlist length changes.
  useEffect(() => {
    if (count === 0) return
    const start = controlled ? ((activeIndex % count) + count) % count : 0
    setIndices([start, (start + 1) % count])
    setActiveSlot(0)
    activeSlotRef.current = 0
    displayedIndexRef.current = start
    setOpacity([1, 0])
    fadingRef.current = false
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps -- only reset on playlist size

  // Controlled sync from Hero.
  useEffect(() => {
    if (!controlled || count === 0) return
    void crossfadeToIndex(activeIndex)
  }, [activeIndex, controlled, count, crossfadeToIndex])

  useEffect(() => () => clearFadeTimer(), [clearFadeTimer])

  useEffect(() => {
    const active = getRef(activeSlot).current
    void ensurePlay(active, `slot-${activeSlot}-active`)
  }, [activeSlot, getRef, indices])

  // Preload following clip into the hidden slot when indices update.
  useEffect(() => {
    if (count < 2) return
    const inactive = (activeSlot === 0 ? 1 : 0) as 0 | 1
    const el = getRef(inactive).current
    if (!el) return
    el.load()
  }, [activeSlot, getRef, indices, count])

  if (count === 0) {
    return (
      <div
        aria-hidden
        className={cn('pointer-events-none absolute inset-0 z-0 bg-black', className)}
      />
    )
  }

  const overlayClass =
    overlayOpacity <= 0.45
      ? 'bg-black/45'
      : overlayOpacity >= 0.55
        ? 'bg-black/55'
        : 'bg-black/50'

  const renderSlot = (slot: 0 | 1) => {
    const src = sources[indices[slot] % count]
    const isActive = slot === activeSlot

    return (
      <div
        key={`layer-${slot}`}
        className="absolute inset-0 z-0 transition-opacity duration-500 ease-in-out"
        style={{ opacity: opacity[slot] }}
      >
        <video
          ref={getRef(slot)}
          src={src}
          autoPlay={isActive}
          muted
          playsInline
          preload="auto"
          // While a scene is active, loop so short clips don't stall before the 8s tick.
          loop
          onLoadedMetadata={(event: SyntheticEvent<HTMLVideoElement>) => {
            const video = event.currentTarget
            void ensurePlay(video, `slot-${slot}-metadata`)
          }}
          onLoadedData={(event: SyntheticEvent<HTMLVideoElement>) => {
            const video = event.currentTarget
            void ensurePlay(video, `slot-${slot}-loadeddata`)
          }}
          onCanPlay={(event: SyntheticEvent<HTMLVideoElement>) => {
            if (slot === activeSlotRef.current) {
              void ensurePlay(event.currentTarget, `slot-${slot}-canplay`)
            }
          }}
          onPlaying={() => log(`slot-${slot} playing`, src)}
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    )
  }

  return (
    <motion.div
      aria-hidden="true"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}
    >
      <div className="absolute inset-0 z-0 bg-black">
        {renderSlot(0)}
        {count > 1 ? renderSlot(1) : null}
      </div>

      <div className={cn('absolute inset-0 z-10', overlayClass)} />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_70%_45%,rgba(255,255,255,0.05),transparent_58%)]" />
    </motion.div>
  )
}
