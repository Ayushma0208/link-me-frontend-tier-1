'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Lock } from 'lucide-react'

import type { UploadedMedia } from '@/components/creator-studio/create-post/MediaDropzone'
import {
  MediaTypeBadge,
  VisibilityBadge,
} from '@/components/creator-studio/VisibilityBadge'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import type { ContentVisibility, PostMediaType } from '@/data/creator-studio'
import { useAuthStore } from '@/stores/auth'
import { cn, formatCurrency } from '@/lib/utils'

const FALLBACK_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=Creator'

export interface PostPreviewPanelProps {
  mediaType: PostMediaType
  files: UploadedMedia[]
  caption: string
  visibility: ContentVisibility
  price: number
  scheduled: boolean
  scheduleAt: string
  className?: string
}

function renderCaption(caption: string) {
  if (!caption.trim()) {
    return (
      <span className="text-white/35 italic">Your caption will appear here…</span>
    )
  }
  const parts = caption.split(/([#@][\w.]+)/g)
  return parts.map((part, i) => {
    if (part.startsWith('#') || part.startsWith('@')) {
      return (
        <span key={i} className="font-medium text-fuchsia-300">
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function PostPreviewPanel({
  mediaType,
  files,
  caption,
  visibility,
  price,
  scheduled,
  scheduleAt,
  className,
}: PostPreviewPanelProps) {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const displayName = user?.name || 'Creator'
  const username = user?.username || 'creator'
  const avatar = user?.avatar || FALLBACK_AVATAR
  const cover = files[0]
  const locked = visibility !== 'public'

  return (
    <StudioGlassCard glow="creator" className={cn('p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            Preview
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">Before publishing</h3>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <MediaTypeBadge type={mediaType} />
          <VisibilityBadge visibility={visibility} />
        </div>
      </div>

      <motion.article
        layout
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[22px] border border-white/10 bg-black/30"
      >
        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
          <div className="relative size-9 overflow-hidden rounded-full ring-1 ring-white/15">
            <Image
              src={avatar}
              alt=""
              fill
              sizes="36px"
              className="object-cover"
              unoptimized={avatar.includes('dicebear') || avatar.startsWith('data:')}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-white">
              {displayName}
              <BadgeCheck className="size-3.5 fill-sky-500 text-white" />
            </p>
            <p className="text-[11px] text-white/40">@{username}</p>
          </div>
        </div>

        <div className="relative aspect-[4/5] bg-zinc-950 sm:aspect-[16/11]">
          {cover ? (
            cover.kind === 'video' ? (
              <video
                src={cover.url}
                className={cn(
                  'size-full object-cover',
                  locked && 'blur-xl scale-110 brightness-75'
                )}
                muted
                playsInline
                autoPlay
                loop
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover.url}
                alt=""
                className={cn(
                  'size-full object-cover',
                  locked && 'blur-xl scale-110 brightness-75'
                )}
              />
            )
          ) : (
            <div className="flex size-full items-center justify-center text-[13px] text-white/30">
              Upload media to preview
            </div>
          )}

          {locked && cover ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 backdrop-blur-[2px]">
              <span className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Lock className="size-5 text-white" />
              </span>
              <p className="text-[13px] font-medium text-white/90">
                {visibility === 'ppv'
                  ? `Unlock · ${formatCurrency(price || 0)}`
                  : 'Subscribers only'}
              </p>
            </div>
          ) : null}

          {files.length > 1 ? (
            <span className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
              1/{files.length}
            </span>
          ) : null}
        </div>

        <div className="space-y-2 px-4 py-3.5">
          <p className="text-[13px] leading-relaxed text-white/75">
            {renderCaption(caption)}
          </p>
          {scheduled && scheduleAt ? (
            <p className="text-[11px] text-amber-200/80">
              Scheduled · {new Date(scheduleAt).toLocaleString()}
            </p>
          ) : (
            <p className="text-[11px] text-white/30">Publishes immediately</p>
          )}
        </div>
      </motion.article>
    </StudioGlassCard>
  )
}
