'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface QuickActionProps {
  label: string
  description: string
  href: string
  icon: LucideIcon
  delay?: number
}

export function QuickAction({
  label,
  description,
  href,
  icon: Icon,
  delay = 0,
}: QuickActionProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
    >
      <Link
        href={href}
        className={cn(
          'group flex items-center gap-3.5 rounded-[20px] border border-white/10',
          'bg-white/[0.04] p-4 backdrop-blur-xl transition-colors',
          'hover:border-fuchsia-400/30 hover:bg-white/[0.07]'
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/25 to-pink-500/20">
          <Icon className="size-5 text-white" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-white">{label}</p>
          <p className="mt-0.5 truncate text-[12px] text-white/40">{description}</p>
        </div>
      </Link>
    </motion.div>
  )
}
