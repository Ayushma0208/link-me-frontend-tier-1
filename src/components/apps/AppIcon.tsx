'use client'

import { motion } from 'framer-motion'

import type { AppItem } from '@/data/apps'
import { cn } from '@/lib/utils'

export interface AppIconProps {
  app: AppItem
  className?: string
}

export function AppIcon({ app, className }: AppIconProps) {
  const Icon = app.icon

  return (
    <motion.a
      href={`#${app.id}`}
      aria-label={app.name}
      title={app.name}
      whileHover={{ y: -6, scale: 1.08 }}
      whileFocus={{ y: -6, scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={cn(
        'group relative flex shrink-0 items-center justify-center',
        'size-16 rounded-[20px] p-[14px] sm:size-20 sm:rounded-[24px] sm:p-4',
        'lg:size-24 lg:rounded-[28px] lg:p-[18px]',
        'border border-white/[0.08] bg-white/[0.08] backdrop-blur-xl',
        'shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
        'outline-none transition-[box-shadow,filter,border-color] duration-300',
        'hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.55)] hover:brightness-110',
        'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/[0.12] via-transparent to-transparent"
      />
      <Icon
        aria-hidden
        className="relative size-7 sm:size-8 lg:size-10"
        style={{ color: app.color }}
      />
    </motion.a>
  )
}
