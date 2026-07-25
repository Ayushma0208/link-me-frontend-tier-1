'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Heart, Reply, Send, X } from 'lucide-react'

import { SeeTranslation } from '@/components/i18n/SeeTranslation'
import {
  addPostComment,
  likeComment,
  listPostComments,
  unlikeComment,
  type PostComment,
} from '@/lib/post-engagement'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const DEFAULT_AVATAR = 'https://picsum.photos/id/64/200/200'

export interface PostCommentsSheetProps {
  postId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommentCountChange?: (count: number) => void
  autoFocus?: boolean
}

type ReplyTarget = {
  id: string
  name: string
  username: string
}

export function PostCommentsSheet({
  postId,
  open,
  onOpenChange,
  onCommentCountChange,
  autoFocus = true,
}: PostCommentsSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [comments, setComments] = useState<PostComment[]>([])
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyboardPad, setKeyboardPad] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open || !postId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setComments([])
    setDraft('')
    setReplyTo(null)
    listPostComments(postId)
      .then((items) => {
        if (!cancelled) setComments(items ?? [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'Could not load comments'
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, postId])

  useEffect(() => {
    if (!open || typeof window === 'undefined') return
    const vv = window.visualViewport
    if (!vv) return

    const sync = () => {
      const occluded = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardPad(occluded > 40 ? occluded : 0)
    }
    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      setKeyboardPad(0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const t = autoFocus
      ? window.setTimeout(() => inputRef.current?.focus(), 180)
      : undefined
    return () => {
      document.body.style.overflow = ''
      if (t) window.clearTimeout(t)
    }
  }, [open, autoFocus])

  function startReply(target: ReplyTarget) {
    setReplyTo(target)
    setDraft((d) => (d.trim() ? d : `@${target.username} `))
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }

  function patchComment(
    commentId: string,
    patch: Partial<Pick<PostComment, 'liked' | 'likeCount'>>
  ) {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) return { ...c, ...patch }
        if (!c.replies?.length) return c
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId ? { ...r, ...patch } : r
          ),
        }
      })
    )
  }

  async function toggleLike(comment: PostComment) {
    if (!postId) return
    const nextLiked = !comment.liked
    const prevCount = comment.likeCount ?? 0
    patchComment(comment.id, {
      liked: nextLiked,
      likeCount: Math.max(0, prevCount + (nextLiked ? 1 : -1)),
    })
    try {
      const res = nextLiked
        ? await likeComment(postId, comment.id)
        : await unlikeComment(postId, comment.id)
      patchComment(comment.id, {
        liked: res.liked,
        likeCount: res.likeCount,
      })
    } catch {
      patchComment(comment.id, {
        liked: comment.liked,
        likeCount: prevCount,
      })
    }
  }

  async function submit() {
    if (!postId || sending) return
    const body = draft.trim()
    if (!body) return
    setSending(true)
    setError(null)
    try {
      const parentId = replyTo?.id ?? null
      const res = await addPostComment(postId, body, parentId)
      if (parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id !== parentId) return c
            return { ...c, replies: [...(c.replies ?? []), res.comment] }
          })
        )
      } else {
        setComments((prev) => [{ ...res.comment, replies: [] }, ...prev])
      }
      setDraft('')
      setReplyTo(null)
      onCommentCountChange?.(res.commentCount)
      inputRef.current?.focus()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not post comment')
    } finally {
      setSending(false)
    }
  }

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close comments"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col',
          'rounded-t-[24px] border border-white/12 border-b-0 bg-[#0c0c12]',
          'shadow-[0_-24px_80px_rgba(0,0,0,0.55)]',
          'h-[min(85dvh,640px)]'
        )}
        style={{
          paddingBottom: keyboardPad
            ? keyboardPad
            : 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-[15px] font-semibold text-white">Comments</p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3">
          {loading ? (
            <p className="py-10 text-center text-[13px] text-white/40">
              Loading…
            </p>
          ) : comments.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-white/40">
              No comments yet. Be the first.
            </p>
          ) : (
            comments.map((c) => (
              <CommentBlock
                key={c.id}
                comment={c}
                threadId={c.id}
                onReply={startReply}
                onToggleLike={toggleLike}
                replyActiveId={replyTo?.id ?? null}
              />
            ))
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 px-3 pt-3">
          {replyTo ? (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-fuchsia-500/15 px-3 py-1.5">
              <p className="truncate text-[12px] text-fuchsia-100">
                Replying to <span className="font-semibold">{replyTo.name}</span>
              </p>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="shrink-0 text-[11px] font-medium text-white/60 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : null}
          {error ? (
            <p className="mb-2 text-[12px] text-rose-300">{error}</p>
          ) : null}
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] py-1.5 pr-1.5 pl-3">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void submit()
                }
              }}
              placeholder={
                replyTo ? `Reply to ${replyTo.name}…` : 'Write a comment…'
              }
              maxLength={2000}
              enterKeyHint="send"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/35"
            />
            <button
              type="button"
              disabled={!draft.trim() || sending}
              onClick={() => void submit()}
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition',
                'hover:bg-white/90 disabled:opacity-40'
              )}
              aria-label="Send"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function CommentBlock({
  comment,
  threadId,
  onReply,
  onToggleLike,
  replyActiveId,
  nested = false,
}: {
  comment: PostComment
  threadId: string
  onReply: (target: ReplyTarget) => void
  onToggleLike: (comment: PostComment) => void
  replyActiveId: string | null
  nested?: boolean
}) {
  const name = comment.user.displayName || comment.user.username
  const replies = comment.replies ?? []
  const likeCount = comment.likeCount ?? 0

  return (
    <div className={cn(nested && 'ml-8 border-l border-white/10 pl-3')}>
      <div className="flex gap-2.5">
        <Image
          src={comment.user.avatarUrl || DEFAULT_AVATAR}
          alt=""
          width={nested ? 28 : 32}
          height={nested ? 28 : 32}
          className={cn(
            'mt-0.5 shrink-0 rounded-full object-cover',
            nested ? 'size-7' : 'size-8'
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug">
            <span className="font-semibold text-white">{name}</span>{' '}
            <span className="text-white/75">{comment.body}</span>
          </p>
          <SeeTranslation text={comment.body} />
          <div className="mt-1 flex items-center gap-3">
            <span className="text-[11px] text-white/35">
              {formatCommentTime(comment.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => onToggleLike(comment)}
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-semibold transition',
                comment.liked
                  ? 'text-pink-300'
                  : 'text-white/50 hover:text-white'
              )}
              aria-label={comment.liked ? 'Unlike comment' : 'Like comment'}
            >
              <Heart
                className={cn('size-3', comment.liked && 'fill-pink-300')}
              />
              {likeCount > 0 ? likeCount : 'Like'}
            </button>
            <button
              type="button"
              onClick={() =>
                onReply({
                  id: threadId,
                  name,
                  username: comment.user.username,
                })
              }
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-semibold transition',
                replyActiveId === threadId
                  ? 'text-fuchsia-300'
                  : 'text-white/50 hover:text-white'
              )}
            >
              <Reply className="size-3" />
              Reply
            </button>
          </div>
        </div>
      </div>

      {replies.length > 0 ? (
        <div className="mt-3 space-y-3">
          {replies.map((r) => (
            <CommentBlock
              key={r.id}
              comment={r}
              threadId={threadId}
              onReply={onReply}
              onToggleLike={onToggleLike}
              replyActiveId={replyActiveId}
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function formatCommentTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}
