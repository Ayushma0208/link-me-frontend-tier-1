'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CalendarDays,
  Coffee,
  Heart,
  ImagePlus,
  MessageCircle,
  Radio,
  Sparkles,
  Timer,
  UserPlus,
} from 'lucide-react'

import type { AppNotification, NotificationType } from '@/data/notifications'
import { feedCreatorsById } from '@/data/user-feed'
import { cn } from '@/lib/utils'

const TYPE_META: Record<
  NotificationType,
  {
    label: string
    icon: ComponentType<{ className?: string }>
    accent: string
    iconWrap: string
    glow: string
  }
> = {
  story_uploaded: {
    label: 'Story',
    icon: Sparkles,
    accent: 'text-fuchsia-300',
    iconWrap: 'border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200',
    glow: 'from-fuchsia-500/20',
  },
  premium_post: {
    label: 'Premium',
    icon: ImagePlus,
    accent: 'text-amber-300',
    iconWrap: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
    glow: 'from-amber-500/20',
  },
  subscription_expiring: {
    label: 'Expiring',
    icon: Timer,
    accent: 'text-orange-300',
    iconWrap: 'border-orange-400/30 bg-orange-500/15 text-orange-200',
    glow: 'from-orange-500/20',
  },
  creator_live: {
    label: 'Live',
    icon: Radio,
    accent: 'text-rose-300',
    iconWrap: 'border-rose-400/30 bg-rose-500/15 text-rose-200',
    glow: 'from-rose-500/25',
  },
  coffee_received: {
    label: 'Coffee',
    icon: Coffee,
    accent: 'text-amber-200',
    iconWrap: 'border-amber-400/25 bg-[#3a2414]/80 text-amber-100',
    glow: 'from-amber-600/20',
  },
  like: {
    label: 'Like',
    icon: Heart,
    accent: 'text-pink-300',
    iconWrap: 'border-pink-400/30 bg-pink-500/15 text-pink-200',
    glow: 'from-pink-500/20',
  },
  comment: {
    label: 'Comment',
    icon: MessageCircle,
    accent: 'text-sky-300',
    iconWrap: 'border-sky-400/30 bg-sky-500/15 text-sky-200',
    glow: 'from-sky-500/20',
  },
  follow: {
    label: 'Follow',
    icon: UserPlus,
    accent: 'text-emerald-300',
    iconWrap: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
    glow: 'from-emerald-500/20',
  },
  event: {
    label: 'Event',
    icon: CalendarDays,
    accent: 'text-violet-300',
    iconWrap: 'border-violet-400/30 bg-violet-500/15 text-violet-200',
    glow: 'from-violet-500/20',
  },
}

export interface NotificationItemProps {
  notification: AppNotification
  index?: number
  onMarkRead?: (id: string) => void
  className?: string
}

export function NotificationItem({
  notification,
  index = 0,
  onMarkRead,
  className,
}: NotificationItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const meta = TYPE_META[notification.type]
  const Icon = meta.icon
  const personId = notification.actorId ?? notification.creatorId
  const person = personId ? feedCreatorsById[personId] : undefined
  const isLive =
    notification.type === 'creator_live' &&
    !notification.read &&
    !notification.liveEnded

  const content = (
    <motion.article
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, x: -16, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={
        prefersReducedMotion
          ? undefined
          : { opacity: 0, x: 12, transition: { duration: 0.2 } }
      }
      transition={{
        delay: Math.min(index * 0.045, 0.32),
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.005 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      onClick={() => onMarkRead?.(notification.id)}
      className={cn(
        'group relative flex gap-3 overflow-hidden rounded-[22px] border p-3.5 sm:gap-3.5 sm:p-4',
        'backdrop-blur-xl transition-[border-color,background-color,box-shadow]',
        notification.read
          ? 'border-white/[0.06] bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]'
          : 'border-white/12 bg-white/[0.07] shadow-[0_16px_44px_rgba(0,0,0,0.32)] hover:border-white/20',
        isLive && 'border-rose-400/25',
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          meta.glow
        )}
      />

      {!notification.read ? (
        <motion.span
          aria-hidden
          className="absolute top-0 left-0 h-full w-[3px] rounded-l-[22px] bg-sky-400"
          initial={prefersReducedMotion ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: index * 0.04 + 0.15, duration: 0.35 }}
          style={{ originY: 0 }}
        />
      ) : null}

      <div className="relative shrink-0">
        {person ? (
          <div className="relative">
            <Image
              src={person.avatar}
              alt=""
              width={48}
              height={48}
              className="size-11 rounded-2xl object-cover ring-1 ring-white/10 sm:size-12"
            />
            {isLive ? (
              <motion.span
                aria-hidden
                className="absolute -inset-1 rounded-[18px] border-2 border-rose-400/70"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: [0.45, 1, 0.45], scale: [1, 1.04, 1] }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : null}
            <span
              className={cn(
                'absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border border-[#07070b]',
                meta.iconWrap
              )}
            >
              <Icon className="size-3" />
            </span>
          </div>
        ) : (
          <span
            className={cn(
              'flex size-11 items-center justify-center rounded-2xl border sm:size-12',
              meta.iconWrap
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-semibold tracking-tight text-white">
                {notification.title}
              </p>
              <span
                className={cn(
                  'rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                  meta.accent
                )}
              >
                {meta.label}
              </span>
              {isLive ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-rose-200 uppercase">
                  <span className="size-1.5 animate-pulse rounded-full bg-rose-400" />
                  Live
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-white/55">
              {notification.body}
            </p>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            {notification.previewUrl ? (
              <div className="relative size-11 overflow-hidden rounded-xl ring-1 ring-white/10 sm:size-12">
                <Image
                  src={notification.previewUrl}
                  alt=""
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="48px"
                />
              </div>
            ) : null}
            {!notification.read ? (
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                aria-label="Unread"
              />
            ) : null}
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px] text-white/35">
          <span>{notification.meta}</span>
          {notification.amount ? (
            <>
              <span className="text-white/15">·</span>
              <span className="font-medium text-amber-200/90">
                {notification.amount}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </motion.article>
  )

  if (notification.href) {
    return (
      <Link href={notification.href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
