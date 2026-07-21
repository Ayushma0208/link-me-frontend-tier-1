'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

import type { ProfileCreatorItem, ProfileMediaItem } from '@/data/user-profile'
import { cn } from '@/lib/utils'

export interface ProfileSectionProps {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  className?: string
  children: React.ReactNode
}

export function ProfileSection({
  title,
  subtitle,
  href,
  linkLabel = 'See all',
  className,
  children,
}: ProfileSectionProps) {
  return (
    <section className={cn('space-y-3.5', className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[13px] text-white/40">{subtitle}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-sky-300 hover:text-sky-200"
          >
            {linkLabel}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function CreatorChipRow({
  creators,
  emptyLabel = 'Nothing here yet',
}: {
  creators: ProfileCreatorItem[]
  emptyLabel?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  if (!creators.length) {
    return <EmptyState label={emptyLabel} />
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {creators.map((creator, index) => (
        <motion.div
          key={creator.id}
          initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <Link
            href={creator.href}
            className={cn(
              'flex w-[132px] shrink-0 flex-col items-center rounded-[20px] border border-white/10',
              'bg-white/[0.04] px-3 py-3.5 text-center backdrop-blur-md',
              'transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]'
            )}
          >
            <Image
              src={creator.avatar}
              alt=""
              width={52}
              height={52}
              className="size-[52px] rounded-full object-cover ring-2 ring-white/10"
            />
            <p className="mt-2.5 w-full truncate text-[13px] font-semibold text-white">
              {creator.name.split(' ')[0]}
            </p>
            <p className="w-full truncate text-[11px] text-white/40">{creator.meta}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export function MediaRail({
  items,
  emptyLabel = 'Nothing here yet',
}: {
  items: ProfileMediaItem[]
  emptyLabel?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  if (!items.length) {
    return <EmptyState label={emptyLabel} />
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          whileHover={prefersReducedMotion ? undefined : { y: -3 }}
        >
          <Link
            href={item.href}
            className="group relative block w-[132px] shrink-0 overflow-hidden rounded-[18px] border border-white/10 sm:w-[148px]"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={item.imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="148px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <p className="truncate text-[12px] font-semibold text-white">{item.title}</p>
                <p className="truncate text-[10px] text-white/45">{item.subtitle}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-[13px] text-white/35">
      {label}
    </div>
  )
}
