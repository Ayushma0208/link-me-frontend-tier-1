'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Lock } from 'lucide-react'

import { SafeImage } from '@/components/media/SafeImage'
import { cn, formatCurrency } from '@/lib/utils'

export interface LockedPostCardProps {
  title: string
  thumbnailUrl: string
  blurredThumbnailUrl?: string
  price: number
  onUnlock?: () => void
  onSubscribe?: () => void
  className?: string
  aspectClassName?: string
}

export function LockedPostCard({
  title,
  thumbnailUrl,
  blurredThumbnailUrl,
  price,
  onUnlock,
  onSubscribe,
  className,
  aspectClassName = 'aspect-square',
}: LockedPostCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group relative overflow-hidden rounded-[22px] border border-white/10 bg-black',
        aspectClassName,
        className
      )}
    >
      <SafeImage
        src={blurredThumbnailUrl || thumbnailUrl}
        alt=""
        fill
        className="scale-110 object-cover blur-2xl brightness-[0.65] transition-transform duration-700 group-hover:scale-125"
        sizes="(max-width:768px) 50vw, 280px"
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Price badge */}
      <span className="absolute top-3 left-3 z-10 rounded-full border border-amber-300/30 bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-100 backdrop-blur-md">
        {formatCurrency(price)}
      </span>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-3 text-center sm:p-4">
        <span className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md sm:size-12">
          <Lock className="size-5 text-white" aria-hidden />
        </span>
        <p className="line-clamp-2 max-w-[16ch] text-[12px] font-medium text-white/90 sm:text-[13px]">
          {title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-2">
          {onUnlock ? (
            <button
              type="button"
              onClick={onUnlock}
              className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-black transition hover:bg-neutral-100"
            >
              Unlock
            </button>
          ) : null}
          {onSubscribe ? (
            <button
              type="button"
              onClick={onSubscribe}
              className="rounded-full border border-white/25 bg-gradient-to-r from-violet-500/40 to-pink-500/40 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md transition hover:from-violet-500/55 hover:to-pink-500/55"
            >
              Subscribe
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
