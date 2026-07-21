'use client'

import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface FloatingFeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  className?: string
  delay?: number
}

export function FloatingFeatureCard({
  title,
  description,
  icon: Icon,
  className,
  delay = 0,
}: FloatingFeatureCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn('absolute z-20', className)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={cn(
          'w-[148px] rounded-2xl border border-white/12 bg-white/[0.06] p-3',
          'shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:w-[168px] sm:p-3.5'
        )}
        animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 4.8 + delay,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4 + delay,
              }
        }
      >
        <div className="mb-2 flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-white">
          <Icon className="size-3.5" aria-hidden="true" strokeWidth={1.75} />
        </div>
        <p className="text-[13px] font-semibold tracking-[-0.02em] text-white">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/50">{description}</p>
      </motion.div>
    </motion.div>
  )
}
