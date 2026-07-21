'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { CreatorSidebar } from '@/components/creator-studio/CreatorSidebar'
import { CreatorTopNavbar } from '@/components/creator-studio/CreatorTopNavbar'
import { useAuthStore } from '@/stores/auth'
import { useCreatorPageStore } from '@/stores/creator-page'
import { cn } from '@/lib/utils'

interface CreatorStudioShellProps {
  children: React.ReactNode
  className?: string
}

export function CreatorStudioShell({ children, className }: CreatorStudioShellProps) {
  const prefersReducedMotion = useReducedMotion()
  const username = useAuthStore((s) => s.user?.username)
  const syncFromAuth = useCreatorPageStore((s) => s.syncFromAuth)

  useEffect(() => {
    if (username) syncFromAuth(username)
  }, [username, syncFromAuth])

  return (
    <div className={cn('flex min-h-svh bg-[#06060a] text-white', className)}>
      <CreatorSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.12),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.08),transparent_40%)]"
        />
        <div className="relative z-30">
          <CreatorTopNavbar />
        </div>
        <motion.main
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex min-w-0 flex-1 flex-col"
        >
          <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  )
}
