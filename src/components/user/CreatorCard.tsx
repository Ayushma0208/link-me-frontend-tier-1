'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import {
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'

import type { CreatorSocialId } from '@/data/creators'
import { cn, formatCurrency, formatFollowers } from '@/lib/utils'

const SOCIAL_ICON: Record<
  CreatorSocialId,
  React.ComponentType<{ className?: string }>
> = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  x: FaXTwitter,
  twitch: FaTwitch,
  spotify: FaSpotify,
}

/** Minimal shape accepted by CreatorCard — works with FeedCreator and similar. */
export interface CreatorCardModel {
  id: string
  name: string
  handle: string
  avatar: string
  coverImage: string
  verified: boolean
  followers: number | string
  socialLinks: CreatorSocialId[]
  monthlyPrice?: number
}

export interface CreatorCardProps {
  creator: CreatorCardModel
  following?: boolean
  subscribed?: boolean
  onFollow?: () => void
  onSubscribe?: () => void
  /** Profile link. Defaults to `/{handle}`. */
  href?: string
  /** Tighter layout for sidebars / grids. */
  compact?: boolean
  className?: string
}

export function CreatorCard({
  creator,
  following = false,
  subscribed = false,
  onFollow,
  onSubscribe,
  href,
  compact = false,
  className,
}: CreatorCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const profileHref = href ?? `/${creator.handle}`
  const followersLabel =
    typeof creator.followers === 'number'
      ? formatFollowers(creator.followers)
      : creator.followers

  return (
    <motion.article
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -6, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }
      }
      className={cn(
        'group relative w-full overflow-hidden rounded-[28px]',
        'border border-white/12 bg-white/[0.06]',
        'shadow-[0_24px_60px_rgba(0,0,0,0.45)]',
        'backdrop-blur-2xl backdrop-saturate-150',
        'transition-[border-color,box-shadow] duration-300',
        'hover:border-white/20 hover:shadow-[0_32px_80px_rgba(0,0,0,0.55),0_0_40px_rgba(168,85,247,0.12)]',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.14] via-transparent to-fuchsia-500/5 opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
      />

      <Link
        href={profileHref}
        className={cn(
          'relative block overflow-hidden',
          compact ? 'h-28' : 'h-36 sm:h-40'
        )}
      >
        <Image
          src={creator.coverImage}
          alt=""
          fill
          sizes="(max-width:640px) 100vw, 360px"
          className={cn(
            'object-cover transition-transform duration-700 ease-out',
            'group-hover:scale-110'
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/40 to-transparent" />
      </Link>

      <div
        className={cn(
          'relative space-y-4 px-4 pb-5 sm:px-5',
          compact ? '-mt-8 space-y-3 px-3.5 pb-4' : '-mt-10'
        )}
      >
        <div className="flex items-end gap-3">
          <Link href={profileHref} className="shrink-0">
            <motion.span
              whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
              className={cn(
                'relative block overflow-hidden ring-[3px] ring-[#0c0c12] shadow-[0_8px_24px_rgba(0,0,0,0.45)]',
                compact ? 'size-14 rounded-2xl' : 'size-[72px] rounded-[22px]'
              )}
            >
              <Image
                src={creator.avatar}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
              />
            </motion.span>
          </Link>

          <div className="min-w-0 flex-1 pb-1">
            <Link
              href={profileHref}
              className={cn(
                'flex items-center gap-1.5 truncate font-semibold tracking-tight text-white hover:underline',
                compact ? 'text-[14px]' : 'text-[16px]'
              )}
            >
              <span className="truncate">{creator.name}</span>
              {creator.verified ? (
                <BadgeCheck
                  className="size-4 shrink-0 fill-sky-500 text-white"
                  aria-label="Verified"
                />
              ) : null}
            </Link>
            <p className="truncate text-[13px] text-white/45">@{creator.handle}</p>
            <p className="mt-1 text-[12px] text-white/50">
              <span className="font-semibold text-white/80">{followersLabel}</span>{' '}
              followers
            </p>
          </div>
        </div>

        {creator.socialLinks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {creator.socialLinks.map((social) => {
              const Icon = SOCIAL_ICON[social]
              return (
                <motion.a
                  key={social}
                  href="#"
                  aria-label={social}
                  onClick={(e) => e.preventDefault()}
                  whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.06 }}
                  className={cn(
                    'flex items-center justify-center rounded-full',
                    'border border-white/12 bg-white/[0.06] text-white/70',
                    'backdrop-blur-md transition-colors',
                    'hover:border-white/25 hover:bg-white/[0.12] hover:text-white',
                    compact ? 'size-8' : 'size-9'
                  )}
                >
                  <Icon className="size-3.5" />
                </motion.a>
              )
            })}
          </div>
        ) : null}

        <div className="flex gap-2.5">
          <motion.button
            type="button"
            onClick={onFollow}
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            className={cn(
              'flex-1 rounded-full text-[13px] font-semibold transition-colors',
              compact ? 'h-9' : 'h-10',
              following
                ? 'border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1]'
                : 'bg-white text-black hover:bg-neutral-100'
            )}
          >
            {following ? 'Following' : 'Follow'}
          </motion.button>

          <motion.button
            type="button"
            onClick={onSubscribe}
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            className={cn(
              'flex-1 rounded-full text-[13px] font-semibold text-white',
              'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
              'shadow-[0_10px_28px_rgba(217,70,239,0.35)]',
              'hover:shadow-[0_14px_36px_rgba(236,72,153,0.4)]',
              compact ? 'h-9' : 'h-10',
              subscribed && 'opacity-90'
            )}
          >
            {subscribed
              ? 'Subscribed'
              : creator.monthlyPrice != null
                ? compact
                  ? 'Subscribe'
                  : `Subscribe · ${formatCurrency(creator.monthlyPrice)}`
                : 'Subscribe'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
