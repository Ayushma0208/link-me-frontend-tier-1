'use client'

import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

export interface FloatingNotificationProps {
  title: string
  body: string
  icon: LucideIcon
  className?: string
  delay?: number
}

export function FloatingNotification({
  title,
  body,
  icon: Icon,
  className,
  delay = 0,
}: FloatingNotificationProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn('absolute z-20', className)}
      initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={cn(
          'flex w-[180px] items-start gap-2.5 rounded-2xl border border-white/12',
          'bg-black/70 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:w-[200px]'
        )}
        animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 5.2 + delay,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.6 + delay,
              }
        }
      >
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <Icon className="size-3.5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-white">{title}</p>
          <p className="mt-0.5 truncate text-[11px] text-white/50">{body}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
