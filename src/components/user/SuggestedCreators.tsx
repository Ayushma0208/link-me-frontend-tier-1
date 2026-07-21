'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Plus } from 'lucide-react'

import type { FeedCreator } from '@/data/user-feed'
import { formatFollowers } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SuggestedCreatorsProps {
  creators: FeedCreator[]
  onFollow?: (creatorId: string) => void
  className?: string
}

export function SuggestedCreators({
  creators,
  onFollow,
  className,
}: SuggestedCreatorsProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase">
            Suggested for you
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
            Creators you might love
          </h2>
        </div>
        <Link
          href="/user/explore"
          className="text-[13px] font-medium text-sky-300 hover:text-sky-200"
        >
          See all
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {creators.map((creator, index) => (
          <motion.article
            key={creator.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            className="relative w-[168px] shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]"
          >
            <div className="relative h-28">
              <Image
                src={creator.coverImage}
                alt=""
                fill
                className="object-cover"
                sizes="168px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>
            <div className="-mt-7 flex flex-col items-center px-3 pb-3.5 text-center">
              <Image
                src={creator.avatar}
                alt=""
                width={52}
                height={52}
                className="size-[52px] rounded-full object-cover ring-2 ring-black"
              />
              <p className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-white">
                <span className="truncate">{creator.name.split(' ')[0]}</span>
                {creator.verified ? (
                  <BadgeCheck className="size-3.5 fill-sky-500 text-white" aria-hidden />
                ) : null}
              </p>
              <p className="text-[11px] text-white/45">
                {formatFollowers(creator.followers)} fans
              </p>
              <div className="mt-3 flex w-full gap-1.5">
                <Link
                  href={`/${creator.handle}`}
                  className="flex h-8 flex-1 items-center justify-center rounded-full border border-white/12 text-[11px] font-medium text-white/80 hover:bg-white/5"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => onFollow?.(creator.id)}
                  className="flex h-8 flex-1 items-center justify-center gap-1 rounded-full bg-white text-[11px] font-semibold text-black hover:bg-neutral-100"
                >
                  <Plus className="size-3.5" aria-hidden />
                  Follow
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
