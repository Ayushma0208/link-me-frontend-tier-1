'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Check, MoreHorizontal, UserPlus } from 'lucide-react'

import { ImagePost } from '@/components/dashboard/ImagePost'
import { LockedPost } from '@/components/dashboard/LockedPost'
import { PostActions } from '@/components/dashboard/PostActions'
import { VideoPost } from '@/components/dashboard/VideoPost'
import {
  formatFeedTime,
  type FeedCreator,
  type FeedPost,
  type FeedSource,
} from '@/data/user-feed'
import { cn } from '@/lib/utils'

const SOURCE_LABEL: Record<FeedSource, string> = {
  following: 'Following',
  subscribed: 'Subscribed',
  trending: 'Recommended',
}

const SOURCE_STYLE: Record<FeedSource, string> = {
  following: 'text-sky-300/85',
  subscribed: 'text-fuchsia-300/85',
  trending: 'text-amber-300/85',
}

export interface PostCardProps {
  post: FeedPost
  creator: FeedCreator
  onUnlock: (post: FeedPost) => void
  className?: string
}

export function PostCard({ post, creator, onUnlock, className }: PostCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [following, setFollowing] = useState(creator.isFollowing)
  const showFollow = !following && !creator.isSubscribed

  function toggleLike() {
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((count) => (wasLiked ? count - 1 : count + 1))
  }

  async function share() {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/${creator.handle}`
        : ''
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.caption, url })
        return
      }
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore
    }
  }

  const slides = post.mediaUrls?.length ? post.mediaUrls : [post.mediaUrl]

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      className={cn(
        'overflow-hidden rounded-[28px]',
        'border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02]',
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
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`/${creator.handle}`}
              className="flex items-center gap-1 truncate text-[14px] font-semibold tracking-tight text-white hover:underline"
            >
              {creator.name}
              {creator.verified ? (
                <BadgeCheck
                  className="size-3.5 fill-sky-500 text-white"
                  aria-hidden
                />
              ) : null}
            </Link>
            <span className="text-[12px] text-white/30">·</span>
            <span className="text-[12px] text-white/40">
              {formatFeedTime(post.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-white/40">
            @{creator.handle}
            <span className="mx-1.5 text-white/15">·</span>
            <span className={SOURCE_STYLE[post.source]}>
              {SOURCE_LABEL[post.source]}
            </span>
          </p>
        </div>

        {showFollow ? (
          <motion.button
            type="button"
            whileHover={prefersReducedMotion ? undefined : { y: -1 }}
            onClick={() => setFollowing(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12px] font-semibold text-black hover:bg-neutral-100"
          >
            <UserPlus className="size-3.5" />
            Follow
          </motion.button>
        ) : creator.isSubscribed ? (
          <span className="inline-flex h-9 items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 text-[12px] font-medium text-emerald-100">
            <Check className="size-3.5" />
            Subscribed
          </span>
        ) : following ? (
          <span className="inline-flex h-9 items-center gap-1 rounded-full border border-white/12 px-3 text-[12px] font-medium text-white/55">
            <Check className="size-3.5" />
            Following
          </span>
        ) : null}

        <button
          type="button"
          className="rounded-full p-2 text-white/35 transition hover:bg-white/5 hover:text-white/70"
          aria-label="More options"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </header>

      {post.locked ? (
        <LockedPost
          title={post.title}
          thumbnailUrl={post.thumbnailUrl}
          blurredThumbnailUrl={post.blurredThumbnailUrl}
          lockKind={post.lockKind === 'subscribers' ? 'subscribers' : 'ppv'}
          price={post.price}
          onUnlock={() => onUnlock(post)}
        />
      ) : post.type === 'video' || post.type === 'reel' ? (
        <VideoPost
          videoUrl={post.videoUrl || post.mediaUrl}
          posterUrl={post.thumbnailUrl}
          alt={post.title}
          reel={post.type === 'reel'}
        />
      ) : (
        <ImagePost urls={slides} alt={post.title} />
      )}

      <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
        <PostActions
          liked={liked}
          saved={saved}
          likeCount={likeCount}
          commentCount={post.comments}
          onLike={toggleLike}
          onSave={() => setSaved((v) => !v)}
          onShare={share}
        />

        <p className="text-[14px] leading-relaxed text-white/70">
          <Link
            href={`/${creator.handle}`}
            className="mr-1.5 font-semibold text-white hover:underline"
          >
            {creator.handle}
          </Link>
          {post.caption}
        </p>

        {post.hashtags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-[13px] font-medium text-sky-300/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.article>
  )
}
