'use client'

import {
  Clapperboard,
  Film,
  Image as ImageIcon,
  Images,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import type { PostMediaType } from '@/data/creator-studio'
import { cn } from '@/lib/utils'

const MEDIA_TYPES: {
  id: PostMediaType
  label: string
  hint: string
  icon: LucideIcon
}[] = [
  { id: 'image', label: 'Image', hint: 'Single photo', icon: ImageIcon },
  { id: 'video', label: 'Video', hint: 'Long-form', icon: Film },
  { id: 'reel', label: 'Reel', hint: 'Vertical short', icon: Clapperboard },
  { id: 'carousel', label: 'Carousel', hint: 'Multi slides', icon: Images },
]

export interface MediaTypePickerProps {
  value: PostMediaType
  onChange: (type: PostMediaType) => void
  className?: string
}

export function MediaTypePicker({
  value,
  onChange,
  className,
}: MediaTypePickerProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('grid grid-cols-2 gap-2.5 sm:grid-cols-4', className)}>
      {MEDIA_TYPES.map((type, index) => {
        const active = value === type.id
        return (
          <motion.button
            key={type.id}
            type="button"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            onClick={() => onChange(type.id)}
            className={cn(
              'relative flex flex-col items-start gap-2 rounded-[20px] border p-3.5 text-left transition',
              active
                ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-white shadow-[0_0_28px_rgba(217,70,239,0.15)]'
                : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/16 hover:text-white'
            )}
          >
            {active ? (
              <motion.span
                layoutId="media-type-glow"
                className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-fuchsia-500/10 to-transparent"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ) : null}
            <type.icon className="relative size-5" strokeWidth={active ? 2.2 : 1.75} />
            <span className="relative">
              <span className="block text-[13px] font-semibold">{type.label}</span>
              <span className="mt-0.5 block text-[11px] opacity-60">{type.hint}</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
