'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'

import { NotificationsTimeline } from '@/components/dashboard/NotificationsTimeline'
import {
  groupNotifications,
  notificationTypeFilters,
  type AppNotification,
  type NotificationType,
} from '@/data/notifications'
import {
  useNotificationsStore,
  type AppNotificationItem,
} from '@/stores/notifications'
import { cn } from '@/lib/utils'

/** Map a backend NotificationType (uppercase) to the timeline's display type. */
function mapType(type: string): NotificationType {
  switch (type) {
    case 'LIVE':
      return 'creator_live'
    case 'STORY':
      return 'story_uploaded'
    case 'POST':
    case 'PPV_PURCHASE':
      return 'premium_post'
    case 'EVENT':
      return 'event'
    case 'SUBSCRIPTION_EXPIRING':
      return 'subscription_expiring'
    case 'COFFEE':
      return 'coffee_received'
    case 'LIKE':
      return 'like'
    case 'COMMENT':
      return 'comment'
    case 'FOLLOW':
      return 'follow'
    default:
      return 'comment'
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const min = Math.round(diff / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const days = Math.round(hr / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function relativeLiveEnded(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'was live'
  const diff = Date.now() - then
  const min = Math.max(1, Math.round(diff / 60000))
  if (min < 60) return `was live ${min} minute${min === 1 ? '' : 's'} ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `was live ${hr} hour${hr === 1 ? '' : 's'} ago`
  const days = Math.round(hr / 24)
  return `was live ${days} day${days === 1 ? '' : 's'} ago`
}

function scheduledLiveBody(iso: string, fallback: string): string {
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return fallback
  const when = new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
  const diff = target - Date.now()
  if (diff <= 0) return `Starting soon · ${when}`
  const totalMin = Math.round(diff / 60000)
  if (totalMin < 60) {
    return `Starts in ${totalMin} min · ${when}`
  }
  const hr = Math.round(totalMin / 60)
  if (hr < 24) return `Starts in ${hr}h · ${when}`
  const days = Math.round(hr / 24)
  return `Starts in ${days}d · ${when}`
}

function toAppNotification(item: AppNotificationItem): AppNotification {
  const data = item.data ?? null
  const ended =
    item.type === 'LIVE' &&
    Boolean(
      data &&
        typeof data === 'object' &&
        'ended' in data &&
        (data as { ended?: unknown }).ended === true
    )

  const scheduled =
    item.type === 'LIVE' &&
    Boolean(
      data &&
        typeof data === 'object' &&
        'scheduled' in data &&
        (data as { scheduled?: unknown }).scheduled === true
    )
  const scheduledAt =
    scheduled &&
    data &&
    typeof data === 'object' &&
    typeof (data as { scheduledAt?: unknown }).scheduledAt === 'string'
      ? String((data as { scheduledAt: string }).scheduledAt)
      : null

  let title = item.title
  if (ended) {
    // "Sofia was live" → "Sofia was live 3 minutes ago"
    const base = item.title.replace(/\s+was live\s*$/i, '').trim() || item.title
    const when =
      data &&
      typeof data === 'object' &&
      typeof (data as { endedAt?: unknown }).endedAt === 'string'
        ? String((data as { endedAt: string }).endedAt)
        : item.createdAt
    title = `${base} ${relativeLiveEnded(when)}`
  }

  const body = scheduledAt
    ? scheduledLiveBody(scheduledAt, item.body)
    : item.body

  return {
    id: item.id,
    type: mapType(item.type),
    title,
    body,
    createdAt: item.createdAt,
    read: item.read,
    href: item.href ?? undefined,
    meta: relativeTime(item.createdAt),
    // A scheduled-live card is upcoming, not an active "join now" badge.
    liveEnded: ended || scheduled,
  }
}

export function NotificationsPage() {
  const prefersReducedMotion = useReducedMotion()
  const storeItems = useNotificationsStore((s) => s.items)
  const refresh = useNotificationsStore((s) => s.refresh)
  const markReadAction = useNotificationsStore((s) => s.markRead)
  const markAllReadAction = useNotificationsStore((s) => s.markAllRead)
  const [filter, setFilter] = useState<NotificationType | 'all'>('all')

  useEffect(() => {
    void refresh()
  }, [refresh])

  const items = useMemo(
    () => storeItems.map(toAppNotification),
    [storeItems]
  )

  const filtered = useMemo(
    () =>
      filter === 'all' ? items : items.filter((item) => item.type === filter),
    [filter, items]
  )
  const groups = useMemo(() => groupNotifications(filtered), [filtered])
  const unreadCount = items.filter((item) => !item.read).length

  function markRead(id: string) {
    void markReadAction(id)
  }

  function markAllRead() {
    void markAllReadAction()
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 sm:space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase"
          >
            Activity
          </motion.p>
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
          >
            <span className="relative flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
              <Bell className="size-5 text-white/80" aria-hidden />
              {unreadCount > 0 ? (
                <motion.span
                  initial={prefersReducedMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-sky-400 text-[9px] font-bold text-[#07070b]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              ) : null}
            </span>
            Notifications
          </motion.h1>
          <p className="max-w-md text-[14px] text-white/45 sm:text-[15px]">
            Stories, premium drops, lives, coffee, and social activity — in one
            timeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {unreadCount > 0 ? (
              <motion.span
                key="unread"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1.5 text-[12px] font-medium text-sky-200"
              >
                {unreadCount} unread
              </motion.span>
            ) : (
              <motion.span
                key="caught-up"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/40"
              >
                All caught up
              </motion.span>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3.5 text-[12px] font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck className="size-3.5" aria-hidden />
            Mark all read
          </button>
        </div>
      </header>

      <div className="-mx-1 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {notificationTypeFilters.map((chip, index) => {
            const active = filter === chip.id
            return (
              <motion.button
                key={chip.id}
                type="button"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + index * 0.025 }}
                onClick={() => setFilter(chip.id)}
                className={cn(
                  'relative h-8 shrink-0 rounded-full border px-3.5 text-[12px] font-medium transition',
                  active
                    ? 'border-white/20 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/16 hover:text-white/80'
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="notif-filter"
                    className="absolute inset-0 rounded-full bg-white/[0.1]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{chip.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <NotificationsTimeline groups={groups} onMarkRead={markRead} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
