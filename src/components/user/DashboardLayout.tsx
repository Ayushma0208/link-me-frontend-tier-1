'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { GlobalSearch } from '@/components/user/GlobalSearch'
import { HomeFeed } from '@/components/user/HomeFeed'
import { RightSidebar } from '@/components/user/RightSidebar'
import { Sidebar } from '@/components/user/Sidebar'
import { Stories } from '@/components/user/Stories'
import { cn } from '@/lib/utils'

interface PlaceholderSectionProps {
  title: string
  subtitle?: string
  heightClassName?: string
}

export function FeedPlaceholderSection({
  title,
  subtitle,
  heightClassName = 'min-h-[120px]',
}: PlaceholderSectionProps) {
  return (
    <section
      className={cn(
        'rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] p-5',
        heightClassName
      )}
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/30 uppercase">
        {title}
      </p>
      {subtitle ? <p className="mt-2 text-[13px] text-white/25">{subtitle}</p> : null}
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-white/[0.04] bg-black/20 py-10">
        <span className="text-[12px] text-white/20">Placeholder</span>
      </div>
    </section>
  )
}

/** Empty main-feed blocks for the layout shell (no functionality). */
export function MainFeedPlaceholders() {
  return (
    <div className="space-y-7">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
          Main Feed
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Home</h1>
      </header>
      <Stories />
      <HomeFeed />
    </div>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('flex min-h-svh bg-[#07070b] text-white', className)}>
      <Sidebar />

      <motion.main
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-w-0 flex-1 flex-col"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(76,110,245,0.07),transparent_42%)]"
        />

        {/* Global search bar — desktop sticky / sits under mobile logo bar */}
        <div className="sticky top-14 z-30 border-b border-white/[0.06] bg-[#07070b]/80 px-4 py-3 backdrop-blur-xl lg:top-0 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-2xl">
            <GlobalSearch />
          </div>
        </div>

        <div className="relative mx-auto w-full flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </div>
      </motion.main>

      <RightSidebar />
    </div>
  )
}
