'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Lock, Play } from 'lucide-react'

import type { PublicPost } from '@/data/public-creator'
import { cn, formatCurrency } from '@/lib/utils'

export interface MediaGalleryProps {
  posts: PublicPost[]
  onLockedClick?: (post: PublicPost) => void
  className?: string
}

export function MediaGallery({
  posts,
  onLockedClick,
  className,
}: MediaGalleryProps) {
  const prefersReducedMotion = useReducedMotion()
  const media = posts.filter((p) => !p.locked).concat(posts.filter((p) => p.locked))

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}>
      {media.map((item, index) => (
        <motion.button
          key={item.id}
          type="button"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(index * 0.04, 0.24) }}
          whileHover={prefersReducedMotion ? undefined : { y: -3 }}
          onClick={() => {
            if (item.locked) onLockedClick?.(item)
          }}
          className="group relative aspect-square overflow-hidden rounded-[20px] border border-white/10 text-left"
        >
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className={cn(
              'object-cover transition-transform duration-500 group-hover:scale-105',
              item.locked && 'blur-md brightness-75'
            )}
            sizes="(max-width:768px) 50vw, 240px"
          />
          {item.type === 'video' ? (
            <span className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
              <Play className="size-3.5 fill-white" aria-hidden />
            </span>
          ) : null}
          {item.locked ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/40">
              <Lock className="size-5 text-white" aria-hidden />
              <span className="text-[11px] font-semibold tracking-wide text-white/85 uppercase">
                {formatCurrency(item.price || 49)}
              </span>
            </div>
          ) : null}
        </motion.button>
      ))}
    </div>
  )
}
