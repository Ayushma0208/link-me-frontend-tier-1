'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  PlusSquare,
  Clapperboard,
  CircleDot,
  Sparkles,
  Users,
  BarChart3,
  Wallet,
  BadgeIndianRupee,
  Share2,
  Settings,
  ExternalLink,
  Radio,
  MessageSquare,
  PhoneCall,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { Logo } from '@/components/layout/Logo'
import { AccountSwitcher } from '@/components/auth/AccountSwitcher'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useCreatorPageStore } from '@/stores/creator-page'

export type CreatorNavKey =
  | 'dashboard'
  | 'create'
  | 'content'
  | 'stories'
  | 'highlights'
  | 'liveEvents'
  | 'messages'
  | 'calls'
  | 'subscribers'
  | 'monetization'
  | 'analytics'
  | 'revenue'
  | 'socialLinks'
  | 'settings'

export interface StudioNavItem {
  key: CreatorNavKey
  href: string
  icon: LucideIcon
  exact?: boolean
}

export const creatorStudioNav: StudioNavItem[] = [
  { key: 'dashboard', href: '/influencer', icon: LayoutDashboard, exact: true },
  { key: 'create', href: '/influencer/create', icon: PlusSquare },
  { key: 'content', href: '/influencer/content', icon: Clapperboard },
  { key: 'stories', href: '/influencer/stories', icon: CircleDot },
  { key: 'highlights', href: '/influencer/highlights', icon: Sparkles },
  { key: 'liveEvents', href: '/influencer/live', icon: Radio },
  { key: 'messages', href: '/influencer/messages', icon: MessageSquare },
  { key: 'calls', href: '/influencer/calls', icon: PhoneCall },
  { key: 'subscribers', href: '/influencer/subscribers', icon: Users },
  {
    key: 'monetization',
    href: '/influencer/monetization',
    icon: BadgeIndianRupee,
  },
  { key: 'analytics', href: '/influencer/analytics', icon: BarChart3 },
  { key: 'revenue', href: '/influencer/revenue', icon: Wallet },
  { key: 'socialLinks', href: '/influencer/social', icon: Share2 },
  { key: 'settings', href: '/influencer/settings', icon: Settings },
]

const MOBILE_TABS = [
  '/influencer',
  '/influencer/create',
  '/influencer/content',
  '/influencer/monetization',
  '/influencer/settings',
]

function isActive(pathname: string, item: StudioNavItem) {
  if (item.exact) return pathname === item.href
  if (item.href === '/influencer/create') {
    return (
      pathname === '/influencer/create' ||
      pathname.startsWith('/influencer/create/')
    )
  }
  if (item.href === '/influencer/content') {
    return (
      pathname.startsWith('/influencer/content') ||
      pathname.startsWith('/influencer/posts')
    )
  }
  if (item.href === '/influencer/revenue') {
    return (
      pathname.startsWith('/influencer/revenue') ||
      pathname.startsWith('/influencer/earnings')
    )
  }
  if (item.href === '/influencer/monetization') {
    return (
      pathname.startsWith('/influencer/monetization') ||
      pathname.startsWith('/influencer/plans') ||
      pathname.startsWith('/influencer/coffee')
    )
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function CreatorSidebar() {
  const t = useTranslations('nav.creator')
  const tc = useTranslations('common')
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const signOutCurrent = useAuthStore((s) => s.signOutCurrent)
  const router = useRouter()
  const publicUsername = useCreatorPageStore((s) => s.claimedUsername)
  const username = user?.username || publicUsername || 'creator'

  async function handleSignOut() {
    const promoted = await signOutCurrent()
    if (!promoted) router.replace('/login?role=creator')
    else router.refresh()
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-svh w-[272px] shrink-0 flex-col border-r border-white/8 bg-[#0a0a10]/90 backdrop-blur-2xl lg:flex">
        <div className="border-b border-white/8 p-5">
          <Link href="/influencer" className="inline-flex">
            <Logo markSize="md" />
          </Link>
          <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-transparent uppercase bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text">
            {tc('creatorStudio')}
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {creatorStudioNav.map((item) => {
            const active = isActive(pathname, item)
            const label = t(item.key)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-medium transition-colors',
                  active
                    ? 'text-white'
                    : 'text-white/45 hover:bg-white/[0.04] hover:text-white'
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="creator-nav-pill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/25 via-fuchsia-500/20 to-pink-500/15 ring-1 ring-inset ring-fuchsia-400/25"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 34 }
                    }
                  />
                ) : null}
                <item.icon
                  className="relative z-10 size-[18px] shrink-0"
                  strokeWidth={active ? 2.25 : 1.75}
                />
                <span className="relative z-10 truncate">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-white/8 p-4">
          <AccountSwitcher loginRole="creator" className="w-full [&>button]:w-full" />
          <Link
            href={`/@${username}`}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[12px] font-medium text-white/70 transition-colors hover:text-white"
          >
            <ExternalLink className="size-3.5" />
            {tc('viewPublicProfile')}
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="w-full text-left text-[12px] text-white/35 transition-colors hover:text-white/70"
          >
            {tc('logout')}
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/8 bg-[#0a0a10]/95 px-1 py-2 backdrop-blur-xl lg:hidden">
        {creatorStudioNav
          .filter((item) => MOBILE_TABS.includes(item.href))
          .map((item) => {
            const active = isActive(pathname, item)
            const label = t(item.key)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px]',
                  active ? 'text-fuchsia-200' : 'text-white/40'
                )}
              >
                <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                {label.split(' ')[0]}
              </Link>
            )
          })}
      </nav>
    </>
  )
}
