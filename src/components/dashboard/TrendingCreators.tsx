'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

import type { FeedCreator } from '@/data/user-feed'
import { cn, formatFollowers } from '@/lib/utils'

export interface TrendingCreatorsProps {
  creators: FeedCreator[]
  className?: string
}

export function TrendingCreators({ creators, className }: TrendingCreatorsProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!creators.length) return null

  return (
    <section className={cn('space-y-3', className)} aria-label="Trending creators">
      <div className="flex items-center gap-2">
        <TrendingUp className="size-4 text-amber-300" aria-hidden />
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
          Trending creators
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {creators.map((creator, index) => (
          <motion.div
            key={creator.id}
            initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
          >
            <Link
              href={`/${creator.handle}`}
              className={cn(
                'group relative flex w-[148px] shrink-0 flex-col overflow-hidden rounded-[20px]',
                'border border-white/10 bg-white/[0.04]',
                'transition-[border-color,transform] duration-300',
                'hover:-translate-y-1.5 hover:border-white/20'
              )}
            >
              <div className="relative h-20">
                <Image
                  src={creator.coverImage}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="148px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
              </div>
              <div className="-mt-5 flex flex-col items-center px-3 pb-3 text-center">
                <Image
                  src={creator.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover ring-2 ring-[#0a0a0f]"
                />
                <p className="mt-1.5 truncate text-[12px] font-semibold text-white">
                  {creator.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-white/40">
                  {formatFollowers(creator.followers)} fans
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
