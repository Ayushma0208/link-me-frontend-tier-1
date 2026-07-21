'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CreditCard,
  Home,
  Radio,
  Settings,
  UserRound,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/user', icon: Home, exact: true },
  { label: 'Subscriptions', href: '/user/subscriptions', icon: CreditCard },
  { label: 'Live', href: '/user/live', icon: Radio },
  { label: 'Billing', href: '/user/wallet', icon: Wallet },
  { label: 'Profile', href: '/user/profile', icon: UserRound },
  { label: 'Settings', href: '/user/settings', icon: Settings },
]

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  return (
    <>
      {/* Desktop / tablet left rail */}
      <motion.aside
        initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'sticky top-0 hidden h-svh w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0f] lg:flex xl:w-[260px]',
          className
        )}
      >
        <div className="px-5 pt-6 pb-4">
          <Link href="/user" className="inline-flex">
            <Logo markSize="md" />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 pb-4" aria-label="User dashboard">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition-colors',
                  active
                    ? 'bg-white text-black'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <item.icon
                  className="size-[18px]"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/[0.06] px-5 py-4">
          <p className="text-[11px] tracking-[0.12em] text-white/25 uppercase">
            LinkMe · Fan
          </p>
        </div>
      </motion.aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-white/[0.06] bg-[#0a0a0f]/90 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/user">
          <Logo markSize="sm" />
        </Link>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/[0.06] bg-[#0a0a0f]/92 px-1 py-2 backdrop-blur-xl lg:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium',
                active ? 'text-white' : 'text-white/40'
              )}
            >
              <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
