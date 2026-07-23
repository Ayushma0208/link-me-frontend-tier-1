'use client'

import { useEffect, useRef } from 'react'
import {
  buildWatermarkPayload,
  paintWatermark,
} from '@/lib/live-watermark'

interface LiveForensicWatermarkProps {
  userId: string
  liveId: string
  /** When false, canvas is cleared and the draw loop stops. */
  active: boolean
}

/**
 * Nearly invisible full-bleed canvas over the live video (audience only).
 * Encodes viewer + live id into a sparse pixel pattern for leak tracing.
 */
export function LiveForensicWatermark({
  userId,
  liveId,
  active,
}: LiveForensicWatermarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let disposed = false
    let lastPaint = 0
    const payload = buildWatermarkPayload(userId, liveId).raw

    function resize() {
      const rect = wrap!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      canvas!.width = Math.floor(w * dpr)
      canvas!.height = Math.floor(h * dpr)
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function tick(now: number) {
      if (disposed) return
      raf = requestAnimationFrame(tick)
      const rect = wrap!.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      if (!active) {
        ctx!.setTransform(1, 0, 0, 1, 0, 0)
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
        return
      }
      // ~3 fps — enough for screenshots, cheap on battery.
      if (now - lastPaint < 320) return
      lastPaint = now
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      paintWatermark(ctx!, w, h, payload, now)
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      if (active) {
        const rect = wrap.getBoundingClientRect()
        paintWatermark(
          ctx,
          Math.max(1, Math.floor(rect.width)),
          Math.max(1, Math.floor(rect.height)),
          payload,
          performance.now()
        )
      }
    })
    ro.observe(wrap)
    raf = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [userId, liveId, active])

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 z-[5]"
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
