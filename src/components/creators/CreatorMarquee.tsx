'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { creatorsRowOne, creatorsRowTwo } from '@/data/creators'
import { cn } from '@/lib/utils'

import { CreatorRow } from './CreatorRow'

interface CreatorMarqueeProps {
  className?: string
}

function GradientWord({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-white via-sky-200 to-white bg-clip-text text-transparent',
        'bg-[length:200%_100%] animate-gradient-shift',
        className
      )}
    >
      {children}
    </span>
  )
}

export function CreatorMarquee({ className }: CreatorMarqueeProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      id="creators"
      className={cn('relative w-full overflow-hidden bg-black py-20 sm:py-24 lg:py-28', className)}
      aria-labelledby="creator-marquee-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-[18%] left-1/2 size-[min(800px,100vw)] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl"
      />

      <div className="relative mx-auto max-w-[920px] px-5 text-center sm:px-8">
        <motion.h2
          id="creator-marquee-heading"
          className="text-[2.25rem] leading-[1.08] font-extrabold tracking-[-0.045em] text-white sm:text-5xl sm:leading-[1.05] lg:text-[4rem] lg:leading-[1.02]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          Global icons
          <br />
          choose <GradientWord>Linkme</GradientWord>
        </motion.h2>

        <motion.p
          className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/50 sm:mt-6 sm:text-lg"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          See why creators around the world rely on one link for content, community, and
          commerce.
        </motion.p>
      </div>

      {/* Full-bleed rows — cards intentionally overflow the viewport edges */}
      <motion.div
        className="relative mt-12 sm:mt-14 lg:mt-16"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-4 sm:gap-5">
          <CreatorRow creators={creatorsRowOne} direction="left" duration={40} />
          <CreatorRow creators={creatorsRowTwo} direction="right" duration={45} />
        </div>

        {/* Soft edge vignette so overflow feels intentional, not clipped hard */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-black to-transparent sm:w-16 lg:w-24"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-black to-transparent sm:w-16 lg:w-24"
        />
      </motion.div>
    </section>
  )
}
