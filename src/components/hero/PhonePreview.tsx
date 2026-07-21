'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, ChevronDown, UserRound } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { SocialGlyph } from '@/components/hero/SocialGlyph'
import type { SocialPlatform } from '@/components/hero/types'
import {
  phoneCreators,
  type PhoneFeaturedCard,
  type PhoneShowcaseCreator,
} from '@/data/creators'
import { HERO_CROSSFADE_SECONDS } from '@/data/hero'
import { cn } from '@/lib/utils'

interface PhonePreviewProps {
  /** Controlled creator from Hero scene sync */
  creator?: PhoneShowcaseCreator
  className?: string
}

function FeaturedCard({ card }: { card: PhoneFeaturedCard }) {
  return (
    <Link
      href={card.href ?? '#'}
      className="block overflow-hidden rounded-2xl border border-white/10 bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      <div className="relative flex aspect-[16/10] items-center justify-center bg-[#0a0a0a]">
        {card.variant === 'kick' ? (
          <span className="select-none text-[2.2rem] font-black tracking-tight text-[#53fc18] sm:text-[2.4rem]">
            KICK
          </span>
        ) : card.imageSrc ? (
          <Image
            src={card.imageSrc}
            alt={card.imageAlt ?? card.title}
            fill
            className="object-cover"
            sizes="272px"
          />
        ) : (
          <span className="text-lg font-bold text-white">{card.title}</span>
        )}
      </div>
      {card.subtitle ? (
        <p className="bg-zinc-950 py-2 text-center text-[11px] font-semibold tracking-[0.14em] text-white uppercase">
          {card.subtitle}
        </p>
      ) : null}
    </Link>
  )
}

function PhoneProfileContent({ creator }: { creator: PhoneShowcaseCreator }) {
  const emailId = `phone-email-${creator.id}`
  const primaryCard = creator.featuredCards[0]

  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[44%] min-h-[200px] shrink-0">
        <Image
          src={creator.coverImage}
          alt={`${creator.name} cover`}
          fill
          priority
          sizes="272px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

        <button
          type="button"
          aria-label="Open profile menu"
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md"
        >
          <UserRound className="size-4" aria-hidden="true" />
        </button>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 sm:px-5 sm:pb-4">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[1.45rem] leading-none font-bold tracking-[-0.03em] text-white sm:text-[1.6rem]">
              {creator.name}
            </h3>
            {creator.verified ? (
              <BadgeCheck
                className="size-4 shrink-0 fill-[#3b82f6] text-white"
                aria-label="Verified creator"
              />
            ) : null}
          </div>
          <p className="mt-1.5 text-[13px] text-white/70">{creator.username}</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-black px-3.5 pt-3 pb-4 sm:px-4">
        <ul
          className="flex items-center justify-center gap-2 sm:gap-2.5"
          aria-label="Social profiles"
        >
          {creator.socialLinks.map((social) => (
            <li key={social.platform}>
              <Link
                href={social.href}
                aria-label={social.label}
                className="flex size-8 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <SocialGlyph
                  platform={social.platform as SocialPlatform}
                  className="size-3.5"
                />
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mx-auto mt-3 flex items-center gap-0.5 text-[12px] font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {creator.followers} Total Followers
          <ChevronDown className="size-3.5 opacity-70" aria-hidden="true" />
        </button>

        <div className="mt-3 flex items-center gap-1.5 rounded-full bg-white p-1 pl-3">
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <input
            id={emailId}
            type="email"
            readOnly
            tabIndex={-1}
            placeholder={creator.emailPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[12px] text-zinc-500 outline-none placeholder:text-zinc-400"
          />
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold text-white">
            <span className="relative size-5 overflow-hidden rounded-full">
              <Image
                src={creator.profileImage}
                alt=""
                fill
                sizes="20px"
                className="object-cover"
              />
            </span>
            Connect with
          </span>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {primaryCard ? <FeaturedCard card={primaryCard} /> : null}
        </div>

        <p className="mt-auto pt-3 text-center text-[11px] font-semibold tracking-[0.16em] text-white uppercase">
          MY SOCIALS
        </p>
      </div>
    </div>
  )
}

export function PhonePreview({
  creator: controlledCreator,
  className,
}: PhonePreviewProps) {
  const prefersReducedMotion = useReducedMotion()
  const creator = controlledCreator ?? phoneCreators[0]!

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 56 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      className={cn('relative z-10 mx-auto w-[248px] shrink-0 sm:w-[272px]', className)}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }
        }
      >
        <div
          className="relative flex h-[512px] flex-col overflow-hidden rounded-[38px] border border-white/10 bg-black shadow-[0_40px_80px_rgba(0,0,0,0.45)] sm:h-[560px] sm:rounded-[42px]"
          role="img"
          aria-label={`${creator.name} Linkme profile preview`}
          aria-live="polite"
        >
          <div className="absolute inset-0 bg-black" aria-hidden />

          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={creator.id}
              className="absolute inset-0"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: HERO_CROSSFADE_SECONDS, ease: 'easeInOut' }}
            >
              <PhoneProfileContent creator={creator} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
