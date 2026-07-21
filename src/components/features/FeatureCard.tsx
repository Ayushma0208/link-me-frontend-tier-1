'use client'

import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  accent?: string
  className?: string
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  accent = 'from-white/25 via-white/5 to-transparent',
  className,
}: FeatureCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.article
      variants={{
        hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -8,
              transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className={cn(
        'group relative overflow-hidden rounded-[24px] border border-white/[0.1]',
        'bg-white/[0.045] p-6',
        'shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]',
        'backdrop-blur-xl backdrop-saturate-150',
        'transition-[border-color,background-color,box-shadow] duration-300',
        'hover:border-white/20 hover:bg-white/[0.07]',
        'hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]',
        'sm:p-7',
        className
      )}
    >
      {/* Accent gradient wash */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90',
          accent
        )}
      />

      {/* Soft highlight orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 size-44 rounded-full bg-white/[0.06] blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Top edge sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      <div className="relative">
        <div
          className={cn(
            'mb-5 flex size-11 items-center justify-center rounded-2xl',
            'border border-white/12 bg-white/[0.08] text-white',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_24px_rgba(0,0,0,0.25)]',
            'transition-transform duration-300 group-hover:scale-105 sm:size-12'
          )}
        >
          <Icon className="size-5 sm:size-[1.35rem]" aria-hidden="true" strokeWidth={1.75} />
        </div>

        <h3 className="text-lg font-semibold tracking-[-0.025em] text-white sm:text-[1.125rem]">
          {title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-white/55 sm:text-[15px]">
          {description}
        </p>
      </div>
    </motion.article>
  )
}
