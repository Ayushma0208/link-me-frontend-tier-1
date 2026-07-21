'use client'

import Image from 'next/image'
import { Eye, Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import {
  MediaTypeBadge,
  VisibilityBadge,
} from '@/components/creator-studio/VisibilityBadge'
import type { StudioPost } from '@/data/creator-studio'
import { formatCurrency, formatFollowers } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: StudioPost
  delay?: number
  className?: string
}

export function PostCard({ post, delay = 0, className }: PostCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      className={className}
    >
      <StudioGlassCard className="overflow-hidden p-0">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <MediaTypeBadge type={post.type} />
            <VisibilityBadge visibility={post.visibility} />
          </div>
          {post.price ? (
            <div className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              {formatCurrency(post.price)}
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <p className="line-clamp-2 text-[13px] font-semibold text-white">
              {post.title}
            </p>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-white/55">
              <span className="inline-flex items-center gap-1">
                <Heart className="size-3" />
                {formatFollowers(post.likes)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3" />
                {formatFollowers(post.views)}
              </span>
            </div>
          </div>
        </div>
      </StudioGlassCard>
    </motion.div>
  )
}

export function VisibilitySelect({
  value,
  onChange,
  className,
}: {
  value: StudioPost['visibility']
  onChange: (v: StudioPost['visibility']) => void
  className?: string
}) {
  const options: StudioPost['visibility'][] = ['public', 'subscribers', 'ppv']
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'rounded-full border px-3.5 py-2 text-[12px] font-semibold capitalize transition-colors',
            value === option
              ? 'border-fuchsia-400/40 bg-fuchsia-500/20 text-white'
              : 'border-white/10 bg-white/[0.04] text-white/50 hover:text-white'
          )}
        >
          {option === 'ppv' ? 'Pay Per View' : option}
        </button>
      ))}
    </div>
  )
}
