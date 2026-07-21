'use client'

import type { PublicCreatorStats } from '@/data/public-creator'
import { cn } from '@/lib/utils'

export interface CreatorStatsProps {
  stats: PublicCreatorStats
  className?: string
}

/** Posts count only — followers / following removed from fan-facing UI. */
export function CreatorStats({ stats, className }: CreatorStatsProps) {
  const postCount = stats.posts ?? 0

  return (
    <div className={cn('flex flex-wrap gap-x-5 gap-y-2', className)}>
      <div className="min-w-[72px]">
        <p className="text-[15px] font-bold tracking-tight text-white">
          {postCount.toLocaleString()}
        </p>
        <p className="text-[11px] text-white/40">Posts</p>
      </div>
    </div>
  )
}
