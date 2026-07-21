'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'

import { SafeImage } from '@/components/media/SafeImage'
import { cn, formatCurrency } from '@/lib/utils'

export interface LockedPostProps {
  title: string
  thumbnailUrl: string
  blurredThumbnailUrl?: string
  /** subscribers → membership; ppv → pay-per-view price */
  lockKind: 'subscribers' | 'ppv'
  price?: number | null
  onUnlock: () => void
  className?: string
}

export function LockedPost({
  title,
  thumbnailUrl,
  blurredThumbnailUrl,
  lockKind,
  price = 99,
  onUnlock,
  className,
}: LockedPostProps) {
  const prefersReducedMotion = useReducedMotion()
  const isMembers = lockKind === 'subscribers'

  return (
    <motion.button
      type="button"
      onClick={onUnlock}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
      className={cn(
        'group relative block w-full overflow-hidden bg-black text-left',
        'aspect-[4/5] sm:aspect-[5/6]',
        className
      )}
    >
      <SafeImage
        src={blurredThumbnailUrl || thumbnailUrl}
        alt=""
        fill
        className="scale-110 object-cover blur-2xl brightness-[0.55] transition-transform duration-700 group-hover:scale-125"
        sizes="(max-width:768px) 100vw, 560px"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/75 backdrop-blur-[1px]" />

      <span
        className={cn(
          'absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md',
          isMembers
            ? 'border-fuchsia-300/30 bg-fuchsia-500/20 text-fuchsia-100'
            : 'border-amber-300/30 bg-amber-400/15 text-amber-100'
        )}
      >
        {isMembers ? (
          <>
            <Sparkles className="size-3.5" />
            Subscribers Only
          </>
        ) : (
          <>Pay {formatCurrency(price ?? 99)}</>
        )}
      </span>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <Lock className="size-5 text-white" />
        </span>
        <div>
          <p className="text-[15px] font-semibold text-white">{title}</p>
          <p className="mt-1.5 text-[13px] text-white/55">
            {isMembers
              ? 'Subscribe to unlock this exclusive drop'
              : 'One-time unlock · keep it forever'}
          </p>
        </div>
        <span
          className={cn(
            'mt-1 inline-flex h-11 items-center rounded-full px-5 text-[13px] font-semibold text-white',
            'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
            'shadow-[0_12px_36px_rgba(217,70,239,0.4)]',
            'transition-transform group-hover:scale-[1.03]'
          )}
        >
          {isMembers ? 'Subscribe to unlock' : `Unlock · ${formatCurrency(price ?? 99)}`}
        </span>
      </div>
    </motion.button>
  )
}
