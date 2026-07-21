'use client'

import Image from 'next/image'
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
  type LucideIcon,
} from 'lucide-react'

import { Logo } from '@/components/layout/Logo'
import { usePublicCreatorsPool } from '@/lib/hooks/use-shared-queries'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
  badge?: string
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
  const { data: creators = [], isLoading: creatorsLoading } =
    usePublicCreatorsPool()

  return (
    <motion.aside
      initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 hidden h-svh w-[280px] shrink-0 flex-col',
        'border-r border-white/[0.07] bg-[#0a0a10]/90 backdrop-blur-2xl',
        'lg:flex',
        className
      )}
    >
      <div className="px-5 pt-6 pb-5">
        <Link href="/user" className="inline-flex">
          <Logo markSize="md" />
        </Link>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-white/30 uppercase">
          For you
        </p>
      </div>

      <nav
        className="flex flex-col gap-0.5 overflow-y-auto px-3 pb-2"
        aria-label="Main"
      >
        {NAV_ITEMS.map((item, index) => {
          const active = isActive(pathname, item)
          return (
            <motion.div
              key={item.href}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.04 + index * 0.03,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] font-medium transition-colors',
                  active
                    ? 'text-white'
                    : 'text-white/45 hover:bg-white/[0.04] hover:text-white'
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="dashboard-nav-pill"
                    className="absolute inset-0 rounded-2xl bg-white/[0.1] ring-1 ring-inset ring-white/15"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 34 }
                    }
                  />
                ) : null}
                <item.icon
                  className="relative z-10 size-[18px]"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="relative z-10 flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="relative z-10 rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-amber-100 uppercase">
                    Soon
                  </span>
                ) : null}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="mt-2 flex min-h-0 flex-1 flex-col border-t border-white/[0.07] px-3 pt-4 pb-2">
        <p className="px-1.5 text-[11px] font-semibold tracking-[0.14em] text-white/30 uppercase">
          AI Creators
        </p>
        <div className="mt-2 flex-1 space-y-1 overflow-y-auto">
          {creatorsLoading ? (
            <p className="px-2 py-3 text-[12px] text-white/30">Loading…</p>
          ) : creators.length === 0 ? (
            <p className="px-2 py-3 text-[12px] text-white/30">No creators yet</p>
          ) : (
            creators.slice(0, 20).map((creator) => (
              <Link
                key={creator.id}
                href={`/${creator.handle}`}
                className="flex items-center gap-2.5 rounded-2xl px-2 py-2 transition-colors hover:bg-white/[0.05]"
              >
                <span className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image
                    src={creator.avatar}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-white">
                    {creator.name}
                  </span>
                  <span className="block truncate text-[11px] text-white/40">
                    @{creator.handle}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.07] p-4">
        <p className="px-1 text-[11px] tracking-[0.12em] text-white/25 uppercase">
          LinkMe · Fan
        </p>
      </div>
    </motion.aside>
  )
}
