'use client'

import { SafeImage } from '@/components/media/SafeImage'
import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'

import { LockedPostCard } from '@/components/creator-profile/LockedPostCard'
import type { PublicPost } from '@/data/public-creator'
import { pickImageSrc } from '@/lib/media-url'
import { cn } from '@/lib/utils'

export interface PostsGridProps {
  posts: PublicPost[]
  freeCount?: number
  subscribed?: boolean
  monthlyPrice?: number
  onUnlock: (post: PublicPost) => void
  onSubscribe: () => void
  className?: string
}

export function PostsGrid({
  posts,
  freeCount = 2,
  subscribed = false,
  monthlyPrice,
  onUnlock,
  onSubscribe,
  className,
}: PostsGridProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('columns-2 gap-3 md:columns-3', className)}>
      {posts.map((post, index) => {
        const isPpv =
          post.unlockReason === 'ppv' ||
          (Boolean(post.price) &&
            post.price > 0 &&
            post.unlockReason !== 'subscription' &&
            post.unlockReason !== 'free' &&
            post.unlockReason !== 'public')
        // Membership unlocks subscriber posts only — pay-per-view stays locked until bought.
        const locked =
          typeof post.locked === 'boolean'
            ? post.locked && !(subscribed && !isPpv)
            : !subscribed && index >= freeCount
        const isFree =
          !locked &&
          (post.unlockReason === 'free' || post.unlockReason === 'public')

        if (locked) {
          return (
            <LockedPostCard
              key={post.id}
              title={post.title}
              thumbnailUrl={post.thumbnailUrl}
              price={post.price || 49}
              monthlyPrice={monthlyPrice}
              lockKind={isPpv ? 'ppv' : 'subscribers'}
              onUnlock={() => onUnlock(post)}
              onSubscribe={subscribed ? undefined : () => onUnlock(post)}
            />
          )
        }

        const mediaSrc = pickImageSrc(post.thumbnailUrl, post.mediaUrl)

        return (
          <motion.article
            key={post.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            whileHover={prefersReducedMotion ? undefined : { y: -4 }}
            className="group relative mb-3 break-inside-avoid overflow-hidden rounded-[22px] border border-white/10"
          >
            <div className="relative aspect-[3/4] bg-black">
              {post.type === 'video' ? (
                <video
                  src={post.mediaUrl}
                  poster={mediaSrc}
                  className="absolute inset-0 size-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <SafeImage
                  src={mediaSrc}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 280px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {isFree ? (
                <span className="absolute top-3 left-3 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-200 uppercase backdrop-blur-md">
                  Free
                </span>
              ) : subscribed && !isPpv ? (
                <span className="absolute top-3 left-3 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-200 uppercase backdrop-blur-md">
                  Member
                </span>
              ) : null}
              {post.type === 'video' ? (
                <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
                  <Play className="size-3.5 fill-white" aria-hidden />
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="truncate text-[13px] font-semibold text-white">{post.title}</p>
                <p className="truncate text-[11px] text-white/45">
                  {post.likes.toLocaleString()} likes
                </p>
              </div>
            </div>
          </motion.article>
        )
      })}
    </div>
  )
}
