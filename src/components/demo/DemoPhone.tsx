'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface DemoPhoneProps {
  videoSrc: string
  videoPoster: string
  className?: string
}

export function DemoPhone({ videoSrc, videoPoster, className }: DemoPhoneProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn('relative mx-auto w-[240px] sm:w-[280px]', className)}
      animate={prefersReducedMotion ? undefined : { y: [0, -14, 0] }}
      transition={
        prefersReducedMotion
          ? undefined
          : { duration: 6.2, repeat: Infinity, ease: 'easeInOut' }
      }
    >
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[48px] bg-white/[0.04] blur-2xl"
      />

      <div
        className={cn(
          'relative overflow-hidden rounded-[40px] border border-white/15 bg-black',
          'shadow-[0_40px_100px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)]',
          'sm:rounded-[44px]'
        )}
      >
        {/* Side buttons */}
        <div
          aria-hidden
          className="absolute top-[96px] -left-[2px] h-8 w-[3px] rounded-l-full bg-white/20"
        />
        <div
          aria-hidden
          className="absolute top-[140px] -left-[2px] h-12 w-[3px] rounded-l-full bg-white/20"
        />
        <div
          aria-hidden
          className="absolute top-[120px] -right-[2px] h-16 w-[3px] rounded-r-full bg-white/20"
        />

        {/* Bezel */}
        <div className="relative m-[10px] overflow-hidden rounded-[32px] bg-zinc-950 sm:m-3 sm:rounded-[34px]">
          {/* Dynamic island */}
          <div
            aria-hidden
            className="absolute top-3 left-1/2 z-10 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black"
          />

          <div className="relative aspect-[9/19.5] w-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={videoPoster}
              className="absolute inset-0 size-full object-cover"
              aria-label="Product demo video"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
