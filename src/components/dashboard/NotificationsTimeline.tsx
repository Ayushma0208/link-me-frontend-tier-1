'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { NotificationItem } from '@/components/dashboard/NotificationItem'
import type { NotificationGroup } from '@/data/notifications'
import { cn } from '@/lib/utils'

export interface NotificationsTimelineProps {
  groups: NotificationGroup[]
  onMarkRead?: (id: string) => void
  className?: string
}

export function NotificationsTimeline({
  groups,
  onMarkRead,
  className,
}: NotificationsTimelineProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!groups.length) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center"
      >
        <p className="text-lg font-semibold text-white">You’re all caught up</p>
        <p className="mt-1 max-w-sm text-[14px] text-white/40">
          Stories, premium drops, lives, and social activity will land here.
        </p>
      </motion.div>
    )
  }

  return (
    <div className={cn('space-y-9', className)}>
      {groups.map((group, groupIndex) => (
        <motion.section
          key={group.key}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: groupIndex * 0.08,
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="space-y-3.5"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase">
              {group.label}
            </h2>
            <motion.span
              aria-hidden
              className="h-px flex-1 origin-left bg-gradient-to-r from-white/15 to-transparent"
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: groupIndex * 0.08 + 0.12, duration: 0.5 }}
            />
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] tabular-nums text-white/40">
              {group.items.length}
            </span>
          </div>

          <div className="relative space-y-2.5 pl-0 sm:pl-4">
            <motion.div
              aria-hidden
              className="absolute top-4 bottom-4 left-[7px] hidden w-px origin-top bg-gradient-to-b from-white/25 via-white/10 to-transparent sm:block"
              initial={prefersReducedMotion ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                delay: groupIndex * 0.08 + 0.2,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            <AnimatePresence initial={false}>
              {group.items.map((item, index) => (
                <div key={item.id} className="relative sm:pl-6">
                  <motion.span
                    aria-hidden
                    className={cn(
                      'absolute top-7 left-0 hidden size-3.5 rounded-full border-2 border-[#07070b] sm:block',
                      item.read
                        ? 'bg-white/25'
                        : 'bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.6)]'
                    )}
                    initial={prefersReducedMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: groupIndex * 0.05 + index * 0.04 + 0.25,
                      type: 'spring',
                      stiffness: 420,
                      damping: 22,
                    }}
                  />
                  {!item.read ? (
                    <motion.span
                      aria-hidden
                      className="absolute top-7 left-0 hidden size-3.5 rounded-full bg-sky-400/40 sm:block"
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : { scale: [1, 1.85, 1], opacity: [0.5, 0, 0.5] }
                      }
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  ) : null}
                  <NotificationItem
                    notification={item}
                    index={index}
                    onMarkRead={onMarkRead}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      ))}
    </div>
  )
}
