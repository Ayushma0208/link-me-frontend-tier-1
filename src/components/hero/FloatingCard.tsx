'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import type { FloatingCardData } from '@/components/hero/types'
import { HERO_CROSSFADE_SECONDS } from '@/data/hero'
import { cn } from '@/lib/utils'

interface FloatingCardProps {
  card: FloatingCardData
  className?: string
}

export function FloatingCard({ card, className }: FloatingCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const isLeft = card.position === 'left'

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: isLeft ? -20 : 20 }}
      animate={
        isLeft
          ? { opacity: 0.7, x: -30, y: -20 }
          : { opacity: 1, x: 0, y: 0 }
      }
      transition={{ duration: 0.7, delay: isLeft ? 0.25 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'pointer-events-none absolute hidden sm:block',
        isLeft
          ? 'top-[16%] left-[calc(50%-185px)] z-[5]'
          : 'top-[42%] left-[calc(50%+111px)] z-20',
        className
      )}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: isLeft ? [0, -12, 0] : [0, -9, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: isLeft ? 6 : 5.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: isLeft ? 1 : 1.25,
              }
        }
        className={cn(
          'relative overflow-hidden rounded-[22px] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.45)]',
          isLeft ? 'h-[182px] w-[124px]' : 'h-[204px] w-[124px]'
        )}
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={card.id}
            className="absolute inset-0"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: HERO_CROSSFADE_SECONDS, ease: 'easeInOut' }}
          >
            <Image
              src={card.imageSrc}
              alt={card.imageAlt}
              fill
              sizes="124px"
              className={cn('object-cover', isLeft ? 'object-top' : 'object-center')}
            />
            {!isLeft ? <div className="absolute inset-0 bg-black/10" /> : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
