'use client'

import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export type SignupRole = 'creator' | 'user'

export interface RoleCardProps {
  id: SignupRole
  title: string
  description: string
  icon: LucideIcon
  selected: boolean
  onSelect: (id: SignupRole) => void
  className?: string
}

export function RoleCard({
  id,
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
  className,
}: RoleCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -4, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }
      }
      animate={
        prefersReducedMotion
          ? undefined
          : { scale: selected ? 1.02 : 1 }
      }
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={cn(
        'group relative w-full rounded-[24px] p-px text-left outline-none',
        'focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        selected
          ? 'bg-gradient-to-br from-white via-white/50 to-white/10 shadow-[0_0_32px_rgba(255,255,255,0.12)]'
          : 'bg-white/[0.08]',
        className
      )}
    >
      <div
        className={cn(
          'relative h-full rounded-[23px] border p-4 sm:p-5',
          'transition-[background-color,border-color,box-shadow] duration-300',
          selected
            ? 'border-transparent bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
            : 'border-white/[0.08] bg-black/40 hover:border-white/15 hover:bg-white/[0.06] hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]'
        )}
      >
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[23px] opacity-0 transition-opacity duration-300',
            'bg-gradient-to-br from-white/[0.1] via-transparent to-transparent',
            'group-hover:opacity-100',
            selected && 'opacity-100'
          )}
        />

        <div className="relative flex items-start gap-3.5">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-2xl border',
              selected
                ? 'border-white/25 bg-white text-black'
                : 'border-white/12 bg-white/[0.08] text-white'
            )}
          >
            <Icon className="size-5" aria-hidden strokeWidth={1.75} />
          </span>

          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-white">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/50">{description}</p>
          </div>
        </div>
      </div>
    </motion.button>
  )
}
