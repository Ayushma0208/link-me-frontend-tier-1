'use client'

import { memo } from 'react'
import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'

import { PlatformIcon } from '@/components/trusted/PlatformIcon'
import type { Creator } from '@/data/creators'
import { cn } from '@/lib/utils'

export interface CreatorCardProps {
  creator: Creator
  className?: string
}

function CreatorCardComponent({ creator, className }: CreatorCardProps) {
  return (
    <article
      className={cn(
        'group relative h-[430px] w-[280px] shrink-0 overflow-hidden rounded-[28px]',
        'border border-white/[0.08] bg-zinc-950',
        'shadow-[0_24px_60px_rgba(0,0,0,0.55)]',
            'transition-[transform,box-shadow,border-color] duration-500 ease-out',
        'hover:z-10 hover:scale-[1.04] hover:border-white/20',
        'hover:shadow-[0_36px_80px_rgba(0,0,0,0.7)]',
        'sm:w-[300px] lg:w-[320px]',
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={creator.coverImage}
          alt=""
          fill
          sizes="(max-width: 640px) 280px, (max-width: 1024px) 300px, 320px"
          className={cn(
            'object-cover transition-[transform,filter] duration-700 ease-out',
            'group-hover:scale-110 group-hover:brightness-110'
          )}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-60"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-black/0 backdrop-blur-[0px] transition-[backdrop-filter,background-color] duration-500 group-hover:bg-black/5"
        />
      </div>

      <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.4)] sm:size-11">
            <Image
              src={creator.profileImage}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-[17px] font-semibold tracking-[-0.025em] text-white sm:text-lg">
                {creator.name}
              </h3>
              {creator.verified ? (
                <BadgeCheck
                  className="size-4 shrink-0 fill-[#3b82f6] text-white sm:size-[1.125rem]"
                  aria-label="Verified"
                />
              ) : null}
            </div>
            <p className="truncate text-[13px] text-white/60">{creator.username}</p>
          </div>
        </div>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-white/70 sm:text-sm">
          {creator.bio}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {creator.socialLinks.map((social) => (
              <span
                key={social}
                className={cn(
                  'flex size-7 items-center justify-center rounded-full',
                  'border border-white/15 bg-white/[0.08] text-white/75',
                  'backdrop-blur-md transition-colors duration-300',
                  'group-hover:border-white/25 group-hover:bg-white/[0.14] group-hover:text-white'
                )}
                aria-label={social}
              >
                <PlatformIcon id={social} className="size-3" />
              </span>
            ))}
          </div>

          <span className="shrink-0 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[11px] font-medium tracking-[-0.01em] text-white/80 backdrop-blur-md sm:text-xs">
            {creator.followers}
            <span className="ml-1 text-white/45">followers</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export const CreatorCard = memo(CreatorCardComponent)
