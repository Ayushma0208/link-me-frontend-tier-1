'use client'

import { useId } from 'react'
import { Check } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export type LoginAccent = 'user' | 'creator' | 'neutral'

interface RememberMeCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  accent?: LoginAccent
  className?: string
}

const checkedByAccent = {
  user: 'border-sky-400/70 bg-gradient-to-br from-sky-500 to-blue-600',
  creator: 'border-fuchsia-400/70 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500',
  neutral: 'border-white/50 bg-white text-black',
} as const

export function RememberMeCheckbox({
  checked,
  onCheckedChange,
  accent = 'neutral',
  className,
}: RememberMeCheckboxProps) {
  const id = useId()
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label="Remember Me"
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative flex size-[18px] shrink-0 items-center justify-center rounded-[6px]',
          'border transition-[border-color,background-color,box-shadow,transform] duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          checked
            ? checkedByAccent[accent]
            : 'border-white/25 bg-white/[0.06] hover:border-white/40'
        )}
      >
        <motion.span
          initial={false}
          animate={{
            opacity: checked ? 1 : 0,
            scale: checked ? 1 : 0.6,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 520, damping: 28 }
          }
        >
          <Check
            className={cn(
              'size-3 stroke-[3]',
              accent === 'neutral' && checked ? 'text-black' : 'text-white'
            )}
            aria-hidden
          />
        </motion.span>
      </button>
      <label
        htmlFor={id}
        className="cursor-pointer text-[13px] text-white/55 transition-colors hover:text-white/75"
      >
        Remember Me
      </label>
    </div>
  )
}
