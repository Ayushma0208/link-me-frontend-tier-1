'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Bell,
  CheckCheck,
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
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.round(hr / 24)}d ago`
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'LIKE')
    return <Heart className="size-4 fill-pink-300 text-pink-300" />
  if (type === 'COMMENT')
    return <MessageCircle className="size-4 text-sky-300" />
  if (type === 'LIVE') return <Radio className="size-4 text-rose-300" />
  return <Bell className="size-4 text-white/50" />
}

export function CreatorNotificationsStudio() {
  const searchParams = useSearchParams()
  const [replyPostId, setReplyPostId] = useState<string | null>(null)
  const items = useNotificationsStore((s) => s.items)
  const unread = useNotificationsStore((s) => s.unreadCount)
  const refresh = useNotificationsStore((s) => s.refresh)
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const postId = searchParams.get('postId')
    if (postId) setReplyPostId(postId)
  }, [searchParams])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/35 uppercase">
            Creator studio
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Notifications
          </h1>
        </div>
        {unread > 0 ? (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </button>
        ) : null}
      </div>

      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-12 text-center text-[14px] text-white/40">
            No notifications yet. Likes and comments on your posts will show
            here in real time.
          </li>
        ) : (
          items.map((n) => {
            const postId = postIdFrom(n)
            const canReply =
              (n.type === 'COMMENT' || n.type === 'LIKE') && !!postId
            return (
              <li
                key={n.id}
                className={cn(
                  'flex gap-3 rounded-2xl border border-white/8 px-4 py-3.5',
                  n.read ? 'bg-white/[0.02]' : 'bg-fuchsia-500/[0.06]'
                )}
              >
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <NotifIcon type={n.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] font-semibold text-white">
                      {n.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-white/35">
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-white/60">{n.body}</p>
                  {canReply ? (
                    <button
                      type="button"
                      onClick={() => {
                        void markRead(n.id)
                        setReplyPostId(postId)
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/20 px-3 py-1.5 text-[12px] font-semibold text-fuchsia-100 hover:bg-fuchsia-500/30"
                    >
                      <Reply className="size-3.5" />
                      {n.type === 'COMMENT' ? 'Reply' : 'View comments'}
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })
        )}
      </ul>

      <PostCommentsSheet
        postId={replyPostId}
        open={!!replyPostId}
        onOpenChange={(next) => {
          if (!next) setReplyPostId(null)
        }}
      />
    </div>
  )
}
