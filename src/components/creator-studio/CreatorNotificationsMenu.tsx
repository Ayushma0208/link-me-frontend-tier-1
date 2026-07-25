'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Bell,
  Heart,
  MessageCircle,
  Radio,
  Reply,
} from 'lucide-react'

import { PostCommentsSheet } from '@/components/dashboard/PostCommentsSheet'
import {
  useNotificationsStore,
  type AppNotificationItem,
} from '@/stores/notifications'
import { cn } from '@/lib/utils'

function postIdFrom(n: AppNotificationItem): string | null {
  const raw = n.data?.postId
  return typeof raw === 'string' && raw.length > 0 ? raw : null
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const min = Math.round((Date.now() - then) / 60000)
  if (min < 1) return 'now'
  if (min < 60) return `${min}m`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h`
  return `${Math.round(hr / 24)}d`
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'LIKE') return <Heart className="size-3.5 fill-pink-300 text-pink-300" />
  if (type === 'COMMENT') return <MessageCircle className="size-3.5 text-sky-300" />
  if (type === 'LIVE') return <Radio className="size-3.5 text-rose-300" />
  return <Bell className="size-3.5 text-white/50" />
}

export function CreatorNotificationsMenu() {
  const prefersReducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [replyPostId, setReplyPostId] = useState<string | null>(null)
  const items = useNotificationsStore((s) => s.items)
  const unread = useNotificationsStore((s) => s.unreadCount)
  const refresh = useNotificationsStore((s) => s.refresh)
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)

  useEffect(() => {
    if (open) void refresh()
  }, [open, refresh])

  function openReply(n: AppNotificationItem) {
    const postId = postIdFrom(n)
    void markRead(n.id)
    setOpen(false)
    if (postId) setReplyPostId(postId)
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setOpen((v) => !v)}
          className="relative flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-[calc(100%+8px)] right-0 z-50 w-[22rem] overflow-hidden rounded-2xl border border-white/12 bg-[#12121a]/95 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <p className="text-[13px] font-semibold text-white">
                  Notifications
                </p>
                {unread > 0 ? (
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    className="text-[11px] font-medium text-fuchsia-300 hover:text-fuchsia-200"
                  >
                    Mark all read
                  </button>
                ) : null}
              </div>

              <ul className="max-h-80 overflow-y-auto p-2">
                {items.length === 0 ? (
                  <li className="rounded-xl px-3 py-6 text-center text-[13px] text-white/40">
                    No notifications yet
                  </li>
                ) : (
                  items.slice(0, 30).map((n) => {
                    const postId = postIdFrom(n)
                    const canReply =
                      (n.type === 'COMMENT' || n.type === 'LIKE') && !!postId
                    return (
                      <li key={n.id}>
                        <div
                          className={cn(
                            'flex gap-2.5 rounded-xl px-3 py-2.5',
                            !n.read && 'bg-white/[0.04]'
                          )}
                        >
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                            <NotifIcon type={n.type} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-white">
                              {n.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[12px] text-white/55">
                              {n.body}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-[10px] text-white/35">
                                {relativeTime(n.createdAt)}
                              </span>
                              {canReply ? (
                                <button
                                  type="button"
                                  onClick={() => openReply(n)}
                                  className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-200 hover:bg-fuchsia-500/30"
                                >
                                  <Reply className="size-3" />
                                  {n.type === 'COMMENT' ? 'Reply' : 'View'}
                                </button>
                              ) : n.href ? (
                                <Link
                                  href={n.href}
                                  onClick={() => {
                                    void markRead(n.id)
                                    setOpen(false)
                                  }}
                                  className="text-[10px] font-semibold text-sky-300 hover:text-sky-200"
                                >
                                  Open
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })
                )}
              </ul>

              <div className="border-t border-white/8 px-3 py-2">
                <Link
                  href="/influencer/notifications"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-center text-[12px] font-medium text-white/70 hover:bg-white/[0.05] hover:text-white"
                >
                  See all notifications
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <PostCommentsSheet
        postId={replyPostId}
        open={!!replyPostId}
        onOpenChange={(next) => {
          if (!next) setReplyPostId(null)
        }}
      />
    </>
  )
}
