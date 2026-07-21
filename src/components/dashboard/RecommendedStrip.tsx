'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { useSuggestedFromPool } from '@/lib/hooks/use-shared-queries'
import { cn } from '@/lib/utils'

export function RecommendedStrip({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion()
  const { data: creators = [], isLoading: loading } = useSuggestedFromPool(4)

  return (
    <DashboardCard
      title="Recommended Creators"
      className={className}
      action={
        <Link
          href="/user/explore"
          className="text-[12px] font-medium text-fuchsia-300 hover:text-pink-200"
        >
          See all
        </Link>
      }
    >
      {loading ? (
        <p className="py-6 text-center text-[12px] text-white/35">Loading creators…</p>
      ) : creators.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-white/35">
          No new creators to recommend — you’re subscribed or following everyone.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/${creator.handle}`}
                className={cn(
                  'flex flex-col items-center rounded-[20px] border border-white/8 bg-white/[0.03] p-3 text-center',
                  'transition-colors hover:border-white/15 hover:bg-white/[0.06]'
                )}
              >
                <div className="relative size-14 overflow-hidden rounded-2xl">
                  <Image
                    src={creator.avatar}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 truncate text-[12px] font-semibold text-white">
                  {creator.name.split(' ')[0]}
                </p>
                <p className="truncate text-[10px] text-white/40">
                  @{creator.handle}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}
