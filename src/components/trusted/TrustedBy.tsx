'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { platformLogos, platformLogosRow2 } from '@/data/trusted'
import { cn } from '@/lib/utils'

import { LogoMarquee } from './LogoMarquee'

interface TrustedByProps {
  className?: string
}

export function TrustedBy({ className }: TrustedByProps) {
  const prefersReducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)

  return (
    <section
      className={cn('w-full overflow-hidden bg-black py-14 sm:py-20', className)}
      aria-labelledby="trusted-by-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.h2
        id="trusted-by-heading"
        className="mx-auto max-w-2xl px-5 text-center text-sm font-medium tracking-[-0.01em] text-white/50 sm:text-base"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        Trusted by creators across every platform
      </motion.h2>

      <div className="mt-10 flex flex-col gap-6 sm:mt-12 sm:gap-8">
        <LogoMarquee
          logos={platformLogos}
          direction="left"
          duration={42}
          paused={paused}
        />
        <LogoMarquee
          logos={platformLogosRow2}
          direction="right"
          duration={48}
          paused={paused}
        />
      </div>
    </section>
  )
}
