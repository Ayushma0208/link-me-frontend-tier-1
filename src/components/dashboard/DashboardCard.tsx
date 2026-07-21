'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface DashboardCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  action?: React.ReactNode
  hoverLift?: boolean
}

export function DashboardCard({
  children,
  className,
  title,
  action,
  hoverLift = true,
}: DashboardCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      whileHover={
        prefersReducedMotion || !hoverLift ? undefined : { y: -3 }
      }
      transition={{ duration: 0.2 }}
      className={cn(
        'relative overflow-hidden rounded-[24px]',
        'border border-white/10 bg-white/[0.04]',
        'shadow-[0_20px_50px_rgba(0,0,0,0.28)]',
        'backdrop-blur-xl backdrop-saturate-150',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div className="relative p-4 sm:p-5">
        {title || action ? (
          <div className="mb-3.5 flex items-center justify-between gap-3">
            {title ? (
              <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {action}
          </div>
        ) : null}
        {children}
      </div>
    </motion.section>
  )
}
