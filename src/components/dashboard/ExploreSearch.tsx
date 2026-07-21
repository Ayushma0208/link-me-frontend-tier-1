'use client'

import { Search, X } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface ExploreSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function ExploreSearch({
  value,
  onChange,
  placeholder = 'Search creators, topics, drops…',
  className,
}: ExploreSearchProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('relative', className)}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] pr-11 pl-11',
          'text-[14px] text-white placeholder:text-white/30',
          'outline-none backdrop-blur-xl transition-[border-color,box-shadow,background-color]',
          'hover:border-white/15 hover:bg-white/[0.07]',
          'focus:border-white/25 focus:bg-white/[0.08] focus:ring-4 focus:ring-white/10'
        )}
        aria-label="Search explore"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </motion.div>
  )
}
