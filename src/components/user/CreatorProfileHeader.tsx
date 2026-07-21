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
import type { FeedCreator } from '@/data/user-feed'
import { cn, formatCurrency, formatFollowers } from '@/lib/utils'

const SOCIAL_ICON: Record<CreatorSocialId, React.ComponentType<{ className?: string }>> = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  x: FaXTwitter,
  twitch: FaTwitch,
  spotify: FaSpotify,
}

export interface CreatorProfileHeaderProps {
  creator: FeedCreator
  following: boolean
  subscribed: boolean
  onFollow: () => void
  onSubscribe: () => void
  className?: string
}

export function CreatorProfileHeader({
  creator,
  following,
  subscribed,
  onFollow,
  onSubscribe,
  className,
}: CreatorProfileHeaderProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'overflow-hidden rounded-[28px] border border-white/10',
        'bg-white/[0.03] shadow-[0_32px_80px_rgba(0,0,0,0.45)]',
        className
      )}
    >
      {/* Hero cover */}
      <div className="relative h-48 overflow-hidden sm:h-64 md:h-72">
        <motion.div
          className="absolute inset-0"
          initial={prefersReducedMotion ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={creator.coverImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width:768px) 100vw, 800px"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-pink-500/10" />
        <div
          aria-hidden
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
      </div>

      <div className="relative -mt-14 space-y-5 px-4 pb-6 sm:-mt-16 sm:space-y-6 sm:px-7 sm:pb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
              className="relative size-[88px] shrink-0 overflow-hidden rounded-[26px] ring-[4px] ring-[#0a0a0f] shadow-[0_16px_40px_rgba(0,0,0,0.5)] sm:size-28 sm:rounded-[30px]"
            >
              <Image
                src={creator.avatar}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
                priority
              />
            </motion.div>

            <div className="min-w-0 pb-1">
              <h1 className="flex items-center gap-1.5 text-[1.65rem] font-extrabold tracking-[-0.04em] text-white sm:text-3xl">
                <span className="truncate">{creator.name}</span>
                {creator.verified ? (
                  <BadgeCheck
                    className="size-5 shrink-0 fill-sky-500 text-white sm:size-6"
                    aria-label="Verified"
                  />
                ) : null}
              </h1>
              <p className="mt-0.5 text-[14px] text-white/45">@{creator.handle}</p>
              <p className="mt-2 text-[13px] text-white/50">
                <span className="font-semibold text-white">
                  {formatFollowers(creator.followers)}
                </span>{' '}
                followers
                <span className="mx-2 text-white/15">·</span>
                <span className="text-white/40">{creator.category}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <motion.button
              type="button"
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              onClick={onFollow}
              className={cn(
                'h-11 rounded-full px-6 text-[14px] font-semibold transition-colors',
                following
                  ? 'border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1]'
                  : 'bg-white text-black hover:bg-neutral-100'
              )}
            >
              {following ? 'Following' : 'Follow'}
            </motion.button>
            <motion.button
              type="button"
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              onClick={onSubscribe}
              className={cn(
                'h-11 rounded-full px-6 text-[14px] font-semibold text-white',
                'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
                'shadow-[0_12px_36px_rgba(217,70,239,0.4)]',
                'hover:shadow-[0_16px_44px_rgba(236,72,153,0.45)]'
              )}
            >
              {subscribed
                ? 'Subscribed'
                : `Subscribe · ${formatCurrency(creator.monthlyPrice)}/mo`}
            </motion.button>
          </div>
        </div>

        <p className="max-w-2xl text-[15px] leading-relaxed text-white/60 sm:text-base">
          {creator.bio}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          {creator.socialLinks.map((social) => {
            const Icon = SOCIAL_ICON[social]
            return (
              <motion.div key={social} whileHover={prefersReducedMotion ? undefined : { y: -2 }}>
                <Link
                  href="#"
                  aria-label={social}
                  onClick={(e) => e.preventDefault()}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full',
                    'border border-white/12 bg-white/[0.05] text-white/70',
                    'backdrop-blur-md transition-colors',
                    'hover:border-white/25 hover:bg-white/[0.1] hover:text-white'
                  )}
                >
                  <Icon className="size-4" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
