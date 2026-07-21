'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Bell } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { GlobalSearch } from '@/components/dashboard/GlobalSearch'
import { Logo } from '@/components/layout/Logo'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { cn } from '@/lib/utils'

interface TopNavbarProps {
  className?: string
}

export function TopNavbar({ className }: TopNavbarProps) {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const avatar =
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username ?? 'fan')}`
  const unreadCount = useNotificationsStore((s) => s.unreadCount)

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-30 border-b transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'border-white/[0.08] bg-[#07070b]/75 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl'
          : 'border-transparent bg-[#07070b]/40 backdrop-blur-xl',
        className
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/user" className="shrink-0 lg:hidden">
          <Logo markSize="sm" />
        </Link>

        <div className="relative mx-auto w-full max-w-xl flex-1">
          <GlobalSearch />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/user/notifications"
            className={cn(
              'relative flex size-10 items-center justify-center rounded-full',
              'border border-white/10 bg-white/[0.04] text-white/70',
              'transition-colors hover:bg-white/[0.08] hover:text-white'
            )}
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-400 px-1 text-[9px] font-bold text-[#07070b] shadow-[0_0_8px_rgba(56,189,248,0.8)]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Link>

          <Link
            href="/user/profile"
            className="relative size-10 overflow-hidden rounded-full border border-white/15 ring-2 ring-white/5 transition-transform hover:scale-[1.03]"
            aria-label="Profile"
          >
            <Image
              src={avatar}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
