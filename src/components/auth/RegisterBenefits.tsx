'use client'

import { Check } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export type BenefitAccent = 'user' | 'creator'

interface RegisterBenefitsProps {
  items: string[]
  accent: BenefitAccent
  className?: string
}

const accentStyles = {
  user: {
    icon: 'border-sky-400/30 bg-sky-400/15 text-sky-300',
    text: 'text-sky-50/80',
  },
  creator: {
    icon: 'border-fuchsia-400/30 bg-gradient-to-br from-violet-500/25 to-pink-500/25 text-pink-200',
    text: 'text-fuchsia-50/80',
  },
} as const

export function RegisterBenefits({ items, accent, className }: RegisterBenefitsProps) {
  const prefersReducedMotion = useReducedMotion()
  const styles = accentStyles[accent]

  return (
    <ul className={cn('grid gap-2.5 sm:grid-cols-2', className)}>
      {items.map((item, index) => (
        <motion.li
          key={item}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: 0.18 + index * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex items-start gap-2.5"
        >
          <span
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
              styles.icon
            )}
          >
            <Check className="size-3" strokeWidth={3} aria-hidden />
          </span>
          <span className={cn('text-[13px] leading-snug', styles.text)}>{item}</span>
        </motion.li>
      ))}
    </ul>
  )
}
