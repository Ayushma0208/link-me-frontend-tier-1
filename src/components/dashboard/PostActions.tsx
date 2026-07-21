'use client'

import { motion } from 'framer-motion'
import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react'

import { cn } from '@/lib/utils'

export interface PostActionsProps {
  liked: boolean
  saved: boolean
  likeCount: number
  commentCount: number
  onLike: () => void
  onSave: () => void
  onComment?: () => void
  onShare?: () => void
  className?: string
}

export function PostActions({
  liked,
  saved,
  likeCount,
  commentCount,
  onLike,
  onSave,
  onComment,
  onShare,
  className,
}: PostActionsProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center gap-0.5">
        <ActionButton
          label={liked ? 'Unlike' : 'Like'}
          active={liked}
          onClick={onLike}
          activeClassName="text-rose-400"
        >
          <Heart className={cn('size-[22px]', liked && 'fill-rose-400')} />
        </ActionButton>
        <ActionButton label="Comments" onClick={onComment}>
          <MessageCircle className="size-[22px]" />
        </ActionButton>
        <ActionButton label="Share" onClick={onShare}>
          <Share2 className="size-[21px]" />
        </ActionButton>
        <ActionButton
          label={saved ? 'Remove bookmark' : 'Bookmark'}
          active={saved}
          onClick={onSave}
          className="ml-auto"
          activeClassName="text-amber-300"
        >
          <Bookmark className={cn('size-[22px]', saved && 'fill-amber-300')} />
        </ActionButton>
      </div>
      <p className="text-[13px] font-semibold text-white">
        {likeCount.toLocaleString()} likes
        <span className="mx-2 font-normal text-white/20">·</span>
        <span className="font-normal text-white/45">
          {commentCount.toLocaleString()} comments
        </span>
      </p>
    </div>
  )
}

function ActionButton({
  label,
  children,
  onClick,
  active,
  activeClassName,
  className,
}: {
  label: string
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  activeClassName?: string
  className?: string
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06 }}
      className={cn(
        'rounded-full p-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white',
        active && activeClassName,
        className
      )}
    >
      {children}
    </motion.button>
  )
}
