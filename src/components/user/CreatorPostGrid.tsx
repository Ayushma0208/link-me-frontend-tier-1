'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'

import { LockedPostCard } from '@/components/user/LockedPostCard'
import type { CreatorProfilePost } from '@/data/user-feed'
import { cn } from '@/lib/utils'

export interface CreatorPostGridProps {
  posts: CreatorProfilePost[]
  freeCount?: number
  onUnlock: (post: CreatorProfilePost) => void
  onSubscribe: () => void
  className?: string
}

export function CreatorPostGrid({
  posts,
  freeCount = 2,
  onUnlock,
  onSubscribe,
  className,
}: CreatorPostGridProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3', className)}>
      {posts.map((post, index) => {
        const forceLocked =
          typeof post.locked === 'boolean'
            ? post.locked
            : index >= freeCount
        const isFree = !forceLocked && (post.unlockReason === 'free' || index < freeCount)

        if (forceLocked) {
          return (
            <motion.div
              key={post.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: Math.min(index * 0.04, 0.28), duration: 0.35 }}
            >
              <LockedPostCard
                title={post.title}
                thumbnailUrl={post.thumbnailUrl}
                blurredThumbnailUrl={post.blurredThumbnailUrl}
                price={post.price}
                onUnlock={() => onUnlock(post)}
                onSubscribe={onSubscribe}
              />
            </motion.div>
          )
        }

        return (
          <motion.div
            key={post.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: Math.min(index * 0.04, 0.28), duration: 0.35 }}
            whileHover={prefersReducedMotion ? undefined : { y: -3 }}
            className="group relative aspect-square overflow-hidden rounded-[22px] border border-white/10"
          >
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 50vw, 260px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            {isFree ? (
              <span className="absolute top-3 left-3 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-200 uppercase backdrop-blur-md">
                Free
              </span>
            ) : null}
            {post.type === 'video' ? (
              <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
                <Play className="size-3.5 fill-white" aria-hidden />
              </span>
            ) : null}
          </motion.div>
        )
      })}
    </div>
  )
}
