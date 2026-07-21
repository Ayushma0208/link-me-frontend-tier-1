'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CalendarClock,
  Copy,
  Eye,
  Heart,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

import {
  MediaTypeBadge,
  VisibilityBadge,
} from '@/components/creator-studio/VisibilityBadge'
import type { StudioPost } from '@/data/creator-studio'
import { formatCurrency, formatFollowers } from '@/lib/utils'

export interface ContentPreviewModalProps {
  post: StudioPost | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function ContentPreviewModal({
  post,
  open,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}: ContentPreviewModalProps) {
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && post ? (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            className="relative z-10 grid max-h-[92dvh] w-full max-w-3xl overflow-hidden rounded-t-[28px] border border-white/12 bg-[#0c0c12]/95 shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:grid-cols-2 sm:rounded-[28px]"
          >
            <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[420px]">
              <Image
                src={post.thumbnail}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 420px"
                priority
              />
            </div>
            <div className="flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  <MediaTypeBadge type={post.type} />
                  <VisibilityBadge visibility={post.visibility} />
                  <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/70 uppercase">
                    {post.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 p-2 text-white/70"
                >
                  <X className="size-4" />
                </button>
              </div>

              <h2 className="mt-4 text-xl font-extrabold tracking-tight text-white">
                {post.title}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-white/55">
                {post.caption || 'No caption yet.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-white/45">
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="size-3.5" />
                  {formatFollowers(post.likes)} likes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" />
                  {formatFollowers(post.views)} views
                </span>
                {post.price ? (
                  <span className="text-amber-200/90">
                    {formatCurrency(post.price)}
                  </span>
                ) : null}
              </div>

              {post.scheduledFor ? (
                <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-amber-200/80">
                  <CalendarClock className="size-3.5" />
                  {new Date(post.scheduledFor).toLocaleString()}
                </p>
              ) : null}

              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-semibold text-black"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-4 text-[12px] font-semibold text-white"
                >
                  <Copy className="size-3.5" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-rose-400/25 bg-rose-500/10 px-4 text-[12px] font-semibold text-rose-200"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
