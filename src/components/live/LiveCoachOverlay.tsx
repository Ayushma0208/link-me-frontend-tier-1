'use client'

import { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import type { LiveCoachTipPayload } from '@/lib/live-socket'

const DISMISS_MS = 12_000

type TipCard = LiveCoachTipPayload & { key: string }

export function LiveCoachOverlay({ tip }: { tip: LiveCoachTipPayload | null }) {
  const [stack, setStack] = useState<TipCard[]>([])

  useEffect(() => {
    if (!tip) return
    const key = `${tip.id}:${tip.createdAt}`
    setStack((prev) => {
      if (prev.some((t) => t.key === key)) return prev
      return [...prev, { ...tip, key }].slice(-3)
    })
    const timer = window.setTimeout(() => {
      setStack((prev) => prev.filter((t) => t.key !== key))
    }, DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [tip])

  if (stack.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-[55] flex flex-col items-stretch gap-2 px-3 sm:px-4">
      {stack.map((card) => (
        <div
          key={card.key}
          className="pointer-events-auto mx-auto w-full max-w-md rounded-2xl border border-sky-400/30 bg-sky-950/85 px-3.5 py-3 shadow-lg backdrop-blur-md"
        >
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-200">
              <Sparkles className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-sky-200/90 uppercase">
                  {card.title}
                </p>
                <button
                  type="button"
                  aria-label="Dismiss tip"
                  onClick={() =>
                    setStack((prev) => prev.filter((t) => t.key !== card.key))
                  }
                  className="rounded-full p-1 text-white/45 transition hover:bg-white/10 hover:text-white/80"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-sky-50/95">
                {card.body}
              </p>
              <p className="mt-1.5 text-[10px] font-medium text-sky-200/55">
                Only you see this
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
