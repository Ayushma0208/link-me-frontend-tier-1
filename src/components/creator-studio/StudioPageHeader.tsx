'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface StudioPageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function StudioPageHeader({
  eyebrow = 'Creator Studio',
  title,
  description,
  actions,
  className,
}: StudioPageHeaderProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-transparent uppercase bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/50 sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.header>
  )
}
