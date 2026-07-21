'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Clapperboard, Lock, Play, TrendingUp } from 'lucide-react'

import { feedCreatorsById, type ExploreItem } from '@/data/user-feed'
import { cn, formatCurrency } from '@/lib/utils'

export interface ExploreMasonryCardProps {
  item: ExploreItem
  onUnlock?: () => void
  trending?: boolean
  className?: string
}

const aspectClass = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[4/3]',
} as const

export function ExploreMasonryCard({
  item,
  onUnlock,
  trending = false,
  className,
}: ExploreMasonryCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const creator = feedCreatorsById[item.creatorId]
  const profileHref = creator ? `/@${creator.handle}` : '/user/explore'
  const isVideo = item.mediaType === 'video' || item.mediaType === 'reel'

  return (
    <motion.article
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -6, transition: { duration: 0.25 } }
      }
      className={cn(
        'group relative mb-3 break-inside-avoid overflow-hidden rounded-[22px]',
        'border border-white/10 bg-[#0c0c12]',
        'shadow-[0_20px_50px_rgba(0,0,0,0.35)]',
        'transition-[border-color,box-shadow] duration-300',
        'hover:border-white/20 hover:shadow-[0_28px_64px_rgba(0,0,0,0.5)]',
        aspectClass[item.aspect],
        className
      )}
    >
      {isVideo && item.videoUrl && !item.locked ? (
        <video
          src={item.videoUrl}
          muted
          loop
          playsInline
          autoPlay
          poster={item.imageUrl}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className={cn(
            'object-cover transition-transform duration-700 ease-out group-hover:scale-110',
            item.locked && 'scale-110 blur-xl brightness-75'
          )}
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
        {trending ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/15 px-2 py-1 text-[10px] font-semibold tracking-wide text-amber-100 uppercase backdrop-blur-md">
            <TrendingUp className="size-3" aria-hidden />
            Hot
          </span>
        ) : (
          <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[10px] font-medium text-white/70 backdrop-blur-md">
            {item.category}
          </span>
        )}
        {item.mediaType === 'reel' ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-300/25 bg-fuchsia-500/20 px-2 py-1 text-[10px] font-semibold text-fuchsia-100 backdrop-blur-md">
            <Clapperboard className="size-3" />
            Reel
          </span>
        ) : item.mediaType === 'video' ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
            <Play className="size-3 fill-white" />
            Video
          </span>
        ) : null}
      </div>

      {item.locked ? (
        <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-2 bg-black/45 p-3 text-center backdrop-blur-[1px]">
          <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <Lock className="size-4 text-white" aria-hidden />
          </span>
          {item.price ? (
            <p className="text-[12px] font-semibold text-amber-200">
              {formatCurrency(item.price)}
            </p>
          ) : null}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onUnlock?.()
            }}
            className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-black hover:bg-neutral-100"
          >
            Unlock
          </button>
        </div>
      ) : null}

      <Link href={profileHref} className="absolute inset-x-0 bottom-0 z-10 p-3.5">
        <p className="truncate text-[13px] font-semibold text-white">{item.title}</p>
        {creator ? (
          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-white/50">
            @{creator.handle}
            {creator.verified ? (
              <BadgeCheck
                className="size-3 fill-sky-500 text-white"
                aria-hidden
              />
            ) : null}
          </p>
        ) : null}
      </Link>
    </motion.article>
  )
}
