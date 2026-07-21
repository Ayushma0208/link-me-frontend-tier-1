'use client'

import { motion } from 'framer-motion'

import type { ExploreCategory } from '@/data/user-feed'
import { cn } from '@/lib/utils'

export interface ExploreCategoriesProps {
  categories: ExploreCategory[]
  value: ExploreCategory
  onChange: (category: ExploreCategory) => void
  className?: string
}

export function ExploreCategories({
  categories,
  value,
  onChange,
  className,
}: ExploreCategoriesProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
        Categories
      </p>
      <div
        className={cn(
          'flex gap-2 overflow-x-auto pb-1',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        )}
        role="tablist"
        aria-label="Explore categories"
      >
        {categories.map((category) => {
          const active = category === value
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(category)}
              className={cn(
                'relative shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors',
                active
                  ? 'text-black'
                  : 'border border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white'
              )}
            >
              {active ? (
                <motion.span
                  layoutId="explore-category-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_8px_24px_rgba(255,255,255,0.12)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10">{category}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
