'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { cn } from '@/lib/utils'

export interface ActivityRow {
  id: string
  title: string
  subtitle: string
  meta: string
  avatar?: string
  amount?: string
}

export interface ActivityFeedProps {
  title: string
  href?: string
  items: ActivityRow[]
  className?: string
  emptyLabel?: string
}

export function ActivityFeed({
  title,
  href,
  items,
  className,
  emptyLabel = 'Nothing here yet',
}: ActivityFeedProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <StudioGlassCard className={cn('p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-white">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-fuchsia-300 hover:text-pink-200"
          >
            View all
            <ArrowUpRight className="size-3.5" />
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-white/35">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, index) => (
            <motion.li
              key={item.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
            >
              {item.avatar ? (
                <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image
                    src={item.avatar}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/20 text-[12px] font-bold text-fuchsia-100">
                  {item.title.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white">
                  {item.title}
                </p>
                <p className="truncate text-[11px] text-white/40">{item.subtitle}</p>
              </div>
              <div className="shrink-0 text-right">
                {item.amount ? (
                  <p className="text-[12px] font-semibold text-emerald-300">
                    {item.amount}
                  </p>
                ) : null}
                <p className="text-[10px] text-white/30">{item.meta}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </StudioGlassCard>
  )
}
