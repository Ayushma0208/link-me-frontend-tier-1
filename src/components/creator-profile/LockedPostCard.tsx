'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Crown, Lock, Zap } from 'lucide-react'

import { SafeImage } from '@/components/media/SafeImage'
import { cn, formatCurrency } from '@/lib/utils'

export interface LockedPostCardProps {
  title: string
  thumbnailUrl: string
  price: number
  monthlyPrice?: number
  lockKind?: 'ppv' | 'subscribers'
  onUnlock?: () => void
  onSubscribe?: () => void
  className?: string
}

export function LockedPostCard({
  title,
  thumbnailUrl,
  price,
  monthlyPrice,
  lockKind = 'ppv',
  onUnlock,
  onSubscribe,
  className,
}: LockedPostCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const isPpv = lockKind === 'ppv'

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      whileHover={prefersReducedMotion ? undefined : { y: -5 }}
      className={cn(
        'group relative mb-3 break-inside-avoid overflow-hidden rounded-[22px]',
        'aspect-[3/4] border border-white/10 bg-black',
        className
      )}
    >
      <SafeImage
        src={thumbnailUrl || 'https://picsum.photos/id/1015/600/750'}
        alt=""
        fill
        className="scale-110 object-cover blur-2xl brightness-[0.65] transition-transform duration-700 group-hover:scale-125"
        sizes="(max-width:768px) 50vw, 280px"
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"
      />

      <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-100 backdrop-blur-md">
        {isPpv ? formatCurrency(price) : 'Members'}
      </span>
      {!isPpv ? (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border border-fuchsia-300/25 bg-fuchsia-500/15 px-2 py-1 text-[10px] font-semibold tracking-wide text-fuchsia-100 uppercase backdrop-blur-md">
          <Crown className="size-3" aria-hidden />
          Sub
        </span>
      ) : (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[10px] font-semibold tracking-wide text-white/90 uppercase backdrop-blur-md">
          <Lock className="size-3" aria-hidden />
          Exclusive
        </span>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 text-center">
        <motion.span
          className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  boxShadow: [
                    '0 0 0 0 rgba(255,255,255,0.15)',
                    '0 0 0 12px rgba(255,255,255,0)',
                  ],
                }
          }
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          <Lock className="size-5 text-white" aria-hidden />
        </motion.span>
        <p className="line-clamp-2 max-w-[16ch] text-[13px] font-medium text-white/90">
          {title}
        </p>
        <div className="mt-1 flex w-full max-w-[200px] flex-col gap-2">
          {onUnlock ? (
            <button
              type="button"
              onClick={onUnlock}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3.5 text-[12px] font-semibold text-black hover:bg-neutral-100"
            >
              <Zap className="size-3.5" aria-hidden />
              See this post · {formatCurrency(price)}
            </button>
          ) : null}
          {!onUnlock && onSubscribe ? (
            <button
              type="button"
              onClick={onSubscribe}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/25 bg-gradient-to-r from-[#ff4d9a]/45 to-[#ffb03a]/40 px-3.5 text-[12px] font-semibold text-white backdrop-blur-md"
            >
              <Crown className="size-3.5" aria-hidden />
              {monthlyPrice
                ? `Subscribe · ${formatCurrency(monthlyPrice)}/mo`
                : 'Subscribe'}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
