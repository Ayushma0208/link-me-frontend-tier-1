'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { CreatorCard } from '@/components/user/CreatorCard'
import type { FeedCreator } from '@/data/user-feed'
import { listDiscoverCreators } from '@/lib/creator-discovery'
import { useFollowStore } from '@/stores/follows'
import { cn } from '@/lib/utils'

interface RightSidebarProps {
  className?: string
}

export function RightSidebar({ className }: RightSidebarProps) {
  const prefersReducedMotion = useReducedMotion()
  const byHandle = useFollowStore((s) => s.byHandle)
  const toggleFollow = useFollowStore((s) => s.toggle)
  const [suggested, setSuggested] = useState<FeedCreator[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await listDiscoverCreators({ limit: 4 })
        if (!cancelled) setSuggested(items)
      } catch {
        if (!cancelled) setSuggested([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [byHandle])

  return (
    <motion.aside
      initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 hidden h-svh w-[300px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-white/[0.06] bg-[#0a0a0f] px-4 py-6 xl:flex',
        className
      )}
    >
      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
          Suggested Creators
        </h2>
        <div className="space-y-3">
          {suggested.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-white/35">
              You’re caught up — no new creators to suggest
            </p>
          ) : (
            suggested.map((creator) => {
              const following = Boolean(
                byHandle[creator.handle.replace(/^@/, '').toLowerCase()]
              )
              return (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  compact
                  following={following}
                  subscribed={false}
                  onFollow={() =>
                    toggleFollow({
                      id: creator.id,
                      handle: creator.handle,
                      name: creator.name,
                      avatar: creator.avatar,
                      category: creator.category,
                      href: `/${creator.handle}`,
                    })
                  }
                />
              )
            })
          )}
        </div>
      </section>
    </motion.aside>
  )
}
