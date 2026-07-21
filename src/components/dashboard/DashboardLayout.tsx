'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { BottomNavigation } from '@/components/dashboard/BottomNavigation'
import { HomeFeed } from '@/components/dashboard/HomeFeed'
import { RecommendedStrip } from '@/components/dashboard/RecommendedStrip'
import { RightSidebar } from '@/components/dashboard/RightSidebar'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Stories } from '@/components/dashboard/Stories'
import { TopNavbar } from '@/components/dashboard/TopNavbar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
  /** Hide the right discovery panel on focused pages. */
  hideRightPanel?: boolean
}

export function DashboardLayout({
  children,
  className,
  hideRightPanel = false,
}: DashboardLayoutProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('flex min-h-svh bg-[#07070b] text-white', className)}>
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,77,154,0.08),transparent_42%),radial-gradient(ellipse_at_top_right,rgba(76,110,245,0.08),transparent_40%)]"
        />

        <TopNavbar />

        <motion.main
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pb-10"
        >
          {children}
        </motion.main>

        <BottomNavigation />
      </div>

      {hideRightPanel ? null : <RightSidebar />}
    </div>
  )
}

/** Home column — Stories + Feed + Recommended. */
export function HomePlaceholders() {
  return (
    <div className="mx-auto w-full max-w-[720px] space-y-7">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
          Home
        </p>
        <h1 className="text-2xl font-extrabold tracking-[-0.04em] text-white sm:text-[1.75rem]">
          Your feed
        </h1>
        <p className="text-[14px] text-white/45">
          Stories, memberships, and recommended creators — in one stream.
        </p>
      </header>

      <Stories />
      <HomeFeed />
      <RecommendedStrip />
    </div>
  )
}
