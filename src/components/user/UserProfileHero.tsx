'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Settings, UserRound } from 'lucide-react'

import { cn, formatFollowers } from '@/lib/utils'

export interface ProfileStat {
  label: string
  value: number | string
  href?: string
}

export interface UserProfileHeroProps {
  name: string
  username: string
  bio: string
  avatar: string
  coverImage: string
  joinedLabel: string
  stats: ProfileStat[]
  className?: string
}

export function UserProfileHero({
  name,
  username,
  bio,
  avatar,
  coverImage,
  joinedLabel,
  stats,
  className,
}: UserProfileHeroProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'overflow-hidden rounded-[28px] border border-white/10',
        'bg-white/[0.03] shadow-[0_28px_70px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      <div className="relative h-40 overflow-hidden sm:h-52">
        <Image
          src={coverImage}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(max-width:768px) 100vw, 900px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/15 via-transparent to-fuchsia-500/15" />
      </div>

      <div className="relative -mt-12 space-y-5 px-4 pb-6 sm:-mt-14 sm:px-7 sm:pb-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative size-[88px] overflow-hidden rounded-[26px] ring-[4px] ring-[#0a0a0f] shadow-[0_14px_36px_rgba(0,0,0,0.45)] sm:size-28 sm:rounded-[30px]">
              <Image src={avatar} alt="" fill className="object-cover" sizes="112px" priority />
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-[1.65rem] font-extrabold tracking-tight text-white sm:text-3xl">
                {name}
              </h1>
              <p className="text-[14px] text-white/45">@{username}</p>
              <p className="mt-1 text-[12px] text-white/35">{joinedLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/user/settings"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[13px] font-semibold text-white transition hover:bg-white/[0.1]"
            >
              <Settings className="size-4" aria-hidden />
              Settings
            </Link>
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-black">
              <UserRound className="size-4" aria-hidden />
              Fan account
            </span>
          </div>
        </div>

        <p className="max-w-2xl text-[15px] leading-relaxed text-white/55">{bio}</p>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {stats.map((stat) => {
            const inner = (
              <div
                className={cn(
                  'rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center backdrop-blur-md',
                  'transition-colors hover:border-white/18 hover:bg-white/[0.07]'
                )}
              >
                <p className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  {typeof stat.value === 'number'
                    ? formatFollowers(stat.value)
                    : stat.value}
                </p>
                <p className="mt-0.5 text-[11px] text-white/40">{stat.label}</p>
              </div>
            )
            return stat.href ? (
              <Link key={stat.label} href={stat.href}>
                {inner}
              </Link>
            ) : (
              <div key={stat.label}>{inner}</div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
