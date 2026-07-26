'use client'

import { motion } from 'framer-motion'
import { Crown, Plane, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VipEntryVisualKey } from '@/lib/vip-entry-effects'

export type VipEnterUser = {
  id: string
  username: string
  name: string
  avatarUrl: string | null
  vipLevel: 'KING'
}

export type VipEnterEffect = {
  id: string
  label: string
  soundUrl: string
  visualKey: VipEntryVisualKey | string
}

export type VipEnterPayload = {
  user: VipEnterUser
  effect?: VipEnterEffect | null
}

interface LiveVipEnterOverlayProps {
  entry: VipEnterPayload | null
  onDismiss: () => void
}

function VisualLayer({ visualKey }: { visualKey: string }) {
  if (visualKey === 'sports_car') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[42%] flex h-16 w-44 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-300 shadow-[0_0_40px_rgba(251,146,60,0.55)]"
          initial={{ x: '-40vw', opacity: 0 }}
          animate={{ x: '110vw', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.6, ease: 'easeInOut' }}
        >
          <span className="text-3xl" aria-hidden>
            🏎️
          </span>
        </motion.div>
      </div>
    )
  }

  if (visualKey === 'gold_jet') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[30%] flex items-center gap-0"
          initial={{ x: '-35vw', y: 40, opacity: 0 }}
          animate={{ x: '110vw', y: -50, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.5, ease: 'easeIn' }}
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-yellow-600 text-black shadow-[0_0_50px_rgba(250,204,21,0.55)]">
            <Plane className="size-8 -rotate-45" />
          </div>
          <div className="h-1 w-40 bg-gradient-to-r from-amber-300/80 to-transparent" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/25 blur-2xl"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1.6, opacity: [0, 0.8, 0] }}
        transition={{ duration: 2.4, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute left-1/2 top-[36%] -translate-x-1/2 text-amber-200"
        initial={{ y: 24, scale: 0.6, opacity: 0 }}
        animate={{ y: -20, scale: 1.25, opacity: [0, 1, 0] }}
        transition={{ duration: 2.4, ease: 'easeOut' }}
      >
        <Crown className="size-16 drop-shadow-[0_0_24px_rgba(251,191,36,0.8)]" />
      </motion.div>
    </div>
  )
}

export function LiveVipEnterOverlay({
  entry,
  onDismiss,
}: LiveVipEnterOverlayProps) {
  if (!entry) return null
  const visualKey = entry.effect?.visualKey ?? 'crown_burst'

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-[70] flex items-start justify-center pt-[16%]'
      )}
      role="status"
      aria-live="polite"
    >
      <VisualLayer visualKey={String(visualKey)} />
      <div className="pointer-events-auto relative z-10 flex max-w-[min(100%,22rem)] items-center gap-3 rounded-2xl border border-amber-300/40 bg-gradient-to-r from-[#3a2a0a]/95 via-[#1a1408]/95 to-[#3a2a0a]/95 px-4 py-3 shadow-[0_0_40px_rgba(251,191,36,0.25)] backdrop-blur-md">
        <div className="flex size-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-200">
          <Crown className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
            {entry.effect?.label ?? 'King entered'}
          </p>
          <p className="truncate bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-[15px] font-bold text-transparent">
            @{entry.user.username}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-1 rounded-full p-1 text-amber-100/50 transition hover:bg-white/10 hover:text-amber-50"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
