'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CreditCard,
  Home,
  Settings,
  UserRound,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface MobileNavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

const MOBILE_NAV: MobileNavItem[] = [
  { label: 'Home', href: '/user', icon: Home, exact: true },
  { label: 'Subscriptions', href: '/user/subscriptions', icon: CreditCard },
  { label: 'Billing', href: '/user/wallet', icon: Wallet },
  { label: 'Profile', href: '/user/profile', icon: UserRound },
  { label: 'Settings', href: '/user/settings', icon: Settings },
]

function isActive(pathname: string, item: MobileNavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

interface BottomNavigationProps {
  className?: string
}

export function BottomNavigation({ className }: BottomNavigationProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.nav
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Mobile navigation"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 lg:hidden',
        'border-t border-white/[0.08] bg-[#0a0a10]/92 backdrop-blur-2xl',
        'px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        className
      )}
    >
      <div className="flex items-center justify-around">
        {MOBILE_NAV.map((item) => {
          const active = isActive(pathname, item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-medium',
                active ? 'text-white' : 'text-white/40'
              )}
            >
              {active ? (
                <motion.span
                  layoutId="dashboard-mobile-pill"
                  className="absolute inset-0 rounded-2xl bg-white/[0.08]"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34 }
                  }
                />
              ) : null}
              <item.icon
                className="relative z-10 size-5"
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
