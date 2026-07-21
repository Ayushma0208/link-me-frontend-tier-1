'use client'

import { forwardRef, useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export type SharedInputAccent = 'user' | 'creator' | 'neutral'

export interface SharedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  accent?: SharedInputAccent
  error?: string
  delay?: number
}

const accentFocus = {
  user: 'focus-visible:border-sky-400/60 focus-visible:ring-sky-400/25',
  creator:
    'focus-visible:border-fuchsia-400/55 focus-visible:ring-fuchsia-400/20',
  neutral: 'focus-visible:border-white/40 focus-visible:ring-white/20',
} as const

export const SharedInput = forwardRef<HTMLInputElement, SharedInputProps>(
  function SharedInput(
    {
      label,
      accent = 'user',
      error,
      delay = 0,
      className,
      id: idProp,
      ...props
    },
    ref
  ) {
    const autoId = useId()
    const id = idProp ?? autoId
    const prefersReducedMotion = useReducedMotion()

    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="space-y-2"
      >
        <label
          htmlFor={id}
          className="block text-[12px] font-medium tracking-[0.08em] text-white/50 uppercase"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-12 w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4',
            'text-[15px] text-white placeholder:text-white/30',
            'outline-none transition-[border-color,box-shadow,background-color] duration-200',
            'hover:border-white/20 hover:bg-white/[0.08]',
            'focus-visible:bg-white/[0.09] focus-visible:ring-4',
            accentFocus[accent],
            error && 'border-red-400/50 focus-visible:border-red-400/60 focus-visible:ring-red-400/20',
            className
          )}
          {...props}
        />
        {error ? <p className="text-[12px] text-red-300/90">{error}</p> : null}
      </motion.div>
    )
  }
)
