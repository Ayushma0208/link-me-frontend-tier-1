'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Check, UserMinus, Users } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { useFollowStore } from '@/stores/follows'
import { cn } from '@/lib/utils'

export default function FollowingPage() {
  const prefersReducedMotion = useReducedMotion()
  const byHandle = useFollowStore((s) => s.byHandle)
  const unfollow = useFollowStore((s) => s.unfollow)
  const creators = Object.values(byHandle).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-5">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
          Following
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
          Creators you follow
        </h1>
        <p className="mt-1.5 text-[14px] text-white/45">
          {creators.length === 0
            ? 'Follow creators from their profile or Explore — they’ll show up here.'
            : `${creators.length} creator${creators.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/12 bg-white/[0.025] px-5 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/50">
            <Users className="size-6" />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-white">
            You’re not following anyone yet
          </p>
          <p className="mt-1.5 max-w-sm text-[13px] text-white/40">
            Open a creator profile and tap Follow to add them to this list.
          </p>
          <Link
            href="/user/explore"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-black"
          >
            Explore creators
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {creators.map((creator, index) => (
            <motion.li
              key={creator.handle}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.24) }}
              className="flex items-center gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-3 sm:p-3.5"
            >
              <Link
                href={creator.href}
                className="relative size-12 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10"
              >
                <Image
                  src={creator.avatar}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={creator.href} className="block truncate">
                  <p className="truncate text-[14px] font-semibold text-white">
                    {creator.name}
                  </p>
                  <p className="truncate text-[12px] text-white/45">
                    @{creator.handle}
                    {creator.category ? ` · ${creator.category}` : ''}
                  </p>
                </Link>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    'hidden items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200 sm:inline-flex'
                  )}
                >
                  <Check className="size-3" />
                  Following
                </span>
                <button
                  type="button"
                  onClick={() => unfollow(creator.handle)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 text-[12px] font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <UserMinus className="size-3.5" />
                  Unfollow
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}
