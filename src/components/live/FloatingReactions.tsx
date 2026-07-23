'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { connectLiveSocket } from '@/lib/live-socket'
import { cn } from '@/lib/utils'

interface Particle {
  id: number
  emoji: string
  left: number
  drift: number
  duration: number
  size: number
  delay: number
}

interface FloatingReactionsProps {
  liveId: string
  className?: string
}

const MAX_PARTICLES = 48
const PARTICLE_TTL_MS = 4500

function spawnBurst(
  emoji: string,
  nextId: () => number,
  opts?: { count?: number; sizeMin?: number; sizeSpan?: number }
): Particle[] {
  const count = opts?.count ?? 5 + Math.floor(Math.random() * 4) // 5–8
  const sizeMin = opts?.sizeMin ?? 22
  const sizeSpan = opts?.sizeSpan ?? 18
  return Array.from({ length: count }, () => ({
    id: nextId(),
    emoji,
    left: 8 + Math.random() * 84,
    drift: -40 + Math.random() * 80,
    duration: 2.4 + Math.random() * 1.6,
    size: sizeMin + Math.random() * sizeSpan,
    delay: Math.random() * 0.35,
  }))
}

/** Multi-particle emoji / gift floats rising over the live video. */
export function FloatingReactions({
  liveId,
  className,
}: FloatingReactionsProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const idRef = useRef(0)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    const socket = connectLiveSocket()
    if (!socket) return

    const join = () => {
      socket.emit('live:join', { liveId })
    }

    const nextId = () => {
      idRef.current += 1
      return idRef.current
    }

    const pushBatch = (batch: Particle[]) => {
      setParticles((prev) => [...prev, ...batch].slice(-MAX_PARTICLES))
      const timer = window.setTimeout(() => {
        const ids = new Set(batch.map((p) => p.id))
        setParticles((prev) => prev.filter((p) => !ids.has(p.id)))
      }, PARTICLE_TTL_MS)
      timersRef.current.push(timer)
    }

    const onEmojiBurst = (payload: { emoji?: string }) => {
      if (!payload.emoji) return
      pushBatch(spawnBurst(payload.emoji, nextId))
    }

    const onGiftBurst = (payload: { emoji?: string }) => {
      if (!payload.emoji) return
      pushBatch(
        spawnBurst(payload.emoji, nextId, {
          count: 7 + Math.floor(Math.random() * 4),
          sizeMin: 30,
          sizeSpan: 22,
        })
      )
    }

    socket.on('live:emoji-burst', onEmojiBurst)
    socket.on('live:gift-burst', onGiftBurst)
    socket.on('connect', join)
    socket.on('reconnect', join)
    if (socket.connected) join()
    else socket.connect()

    return () => {
      for (const t of timersRef.current) window.clearTimeout(t)
      timersRef.current = []
      socket.off('live:emoji-burst', onEmojiBurst)
      socket.off('live:gift-burst', onGiftBurst)
      socket.off('connect', join)
      socket.off('reconnect', join)
      socket.disconnect()
    }
  }, [liveId])

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-30 overflow-hidden',
        className
      )}
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-[8%] animate-live-float will-change-transform"
          style={
            {
              left: `${p.left}%`,
              fontSize: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--live-float-drift': `${p.drift}px`,
            } as CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
