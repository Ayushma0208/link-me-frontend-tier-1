'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BadgeCheck,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Share2,
} from 'lucide-react'

import { SafeImage } from '@/components/media/SafeImage'
import type { FeedCreator, FeedPost, FeedSource } from '@/data/user-feed'
import { cn } from '@/lib/utils'

const SOURCE_LABEL: Record<FeedSource, string> = {
  following: 'Following',
  subscribed: 'Subscribed',
  trending: 'Trending',
}

const SOURCE_STYLE: Record<FeedSource, string> = {
  following: 'text-sky-300/85',
  subscribed: 'text-fuchsia-300/85',
  trending: 'text-amber-300/85',
}

export interface FeedCardProps {
  post: FeedPost
  creator: FeedCreator
  className?: string
}

export function FeedCard({ post, creator, className }: FeedCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  function toggleLike() {
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((count) => (wasLiked ? count - 1 : count + 1))
  }

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'overflow-hidden rounded-[28px]',
        'border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02]',
        'shadow-[0_28px_70px_rgba(0,0,0,0.4)] backdrop-blur-md',
        className
      )}
    >
      <header className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
        <Link
          href={`/${creator.handle}`}
          className="shrink-0 rounded-full ring-2 ring-white/10 transition hover:ring-white/25"
        >
          <Image
            src={creator.avatar}
            alt=""
            width={42}
            height={42}
            className="size-[42px] rounded-full object-cover"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/${creator.handle}`}
            className="flex items-center gap-1 truncate text-[14px] font-semibold tracking-tight text-white hover:underline"
          >
            {creator.name}
            {creator.verified ? (
              <BadgeCheck className="size-3.5 fill-sky-500 text-white" aria-hidden />
            ) : null}
          </Link>
          <p className="mt-0.5 text-[12px] text-white/40">
            @{creator.handle}
            <span className="mx-1.5 text-white/15">·</span>
            <span className={SOURCE_STYLE[post.source]}>{SOURCE_LABEL[post.source]}</span>
          </p>
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-white/35 transition hover:bg-white/5 hover:text-white/70"
          aria-label="More options"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </header>

      <div className="relative aspect-[4/5] bg-black sm:aspect-[5/6]">
        {post.type === 'video' ? (
          <>
            <SafeImage
              src={post.thumbnailUrl || post.mediaUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 560px"
            />
            <span className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
              <Play className="size-3.5 fill-white" aria-hidden />
            </span>
          </>
        ) : (
          <SafeImage
            src={post.mediaUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 560px"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="space-y-3.5 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-1">
          <ActionButton
            label={liked ? 'Unlike' : 'Like'}
            active={liked}
            onClick={toggleLike}
            activeClassName="text-rose-400"
          >
            <Heart className={cn('size-[22px]', liked && 'fill-rose-400')} />
          </ActionButton>

          <ActionButton label="Comments">
            <MessageCircle className="size-[22px]" />
          </ActionButton>

          <ActionButton label="Share">
            <Share2 className="size-[21px]" />
          </ActionButton>

          <ActionButton
            label={saved ? 'Remove bookmark' : 'Bookmark'}
            active={saved}
            onClick={() => setSaved((v) => !v)}
            className="ml-auto"
            activeClassName="text-amber-300"
          >
            <Bookmark className={cn('size-[22px]', saved && 'fill-amber-300')} />
          </ActionButton>
        </div>

        <div className="space-y-1.5">
          <p className="text-[13px] font-semibold text-white">
            {likeCount.toLocaleString()} likes
            <span className="mx-2 font-normal text-white/20">·</span>
            <span className="font-normal text-white/45">
              {post.comments.toLocaleString()} comments
            </span>
          </p>

          <p className="text-[14px] leading-relaxed text-white/70">
            <Link
              href={`/${creator.handle}`}
              className="mr-1.5 font-semibold text-white hover:underline"
            >
              {creator.handle}
            </Link>
            {post.caption}
          </p>
        </div>
      </div>
    </motion.article>
  )
}

interface ActionButtonProps {
  label: string
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  activeClassName?: string
  className?: string
}

function ActionButton({
  label,
  children,
  onClick,
  active,
  activeClassName,
  className,
}: ActionButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
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
