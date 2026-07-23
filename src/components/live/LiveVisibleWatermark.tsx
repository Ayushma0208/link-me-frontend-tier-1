'use client'

import { useEffect, useRef } from 'react'

interface LiveVisibleWatermarkProps {
  username: string
  active: boolean
}

const IDLE_OPACITY = 0.18
const FLASH_OPACITY = 0.4

/**
 * Audience @username overlay for live video.
 *
 * Must stay painted while watching — OS screenshots capture before a
 * keydown→React flash can render. Idle opacity is low; screenshot shortcuts
 * bump opacity synchronously via the DOM for a clearer mark in the capture.
 */
export function LiveVisibleWatermark({
  username,
  active,
}: LiveVisibleWatermarkProps) {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    let timer: ReturnType<typeof setTimeout> | undefined

    const setOpacity = (value: number) => {
      const el = layerRef.current
      if (el) el.style.opacity = String(value)
    }

    const triggerFlash = () => {
      // Sync DOM write so more of the mark is in the frame before OS capture.
      setOpacity(FLASH_OPACITY)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setOpacity(IDLE_OPACITY), 2000)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        triggerFlash()
        return
      }
      if (
        e.metaKey &&
        e.shiftKey &&
        (e.key === '3' || e.key === '4' || e.key === '5')
      ) {
        triggerFlash()
        return
      }
      if (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        triggerFlash()
      }
    }

    const onBeforePrint = () => triggerFlash()

    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('beforeprint', onBeforePrint)

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('beforeprint', onBeforePrint)
    }
  }, [active])

  if (!active) return null

  const label = `@${username.replace(/^@/, '')}`
  // Sparse grid — enough for crops, less wall-of-text while watching.
  const tiles = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[6] overflow-hidden"
      aria-hidden
    >
      <div
        ref={layerRef}
        className="absolute inset-[-20%] flex flex-wrap content-start gap-x-16 gap-y-20"
        style={{
          transform: 'rotate(-22deg)',
          opacity: IDLE_OPACITY,
        }}
      >
        {tiles.map((i) => (
          <span
            key={i}
            className="shrink-0 select-none whitespace-nowrap text-[12px] font-semibold tracking-wide text-white/90 sm:text-[13px]"
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
