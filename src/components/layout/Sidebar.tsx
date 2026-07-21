'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

interface SidebarProps {
  title: string
  subtitle: string
  items: NavItem[]
}

function isItemActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function Sidebar({ title, subtitle, items }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/8 bg-[#0c0c12] md:flex">
        <div className="border-b border-white/8 p-5">
          <Logo markSize="md" />
          <p className="mt-3 text-[11px] font-medium tracking-[0.14em] text-white/35 uppercase">
            {subtitle || title}
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const isActive = isItemActive(pathname, item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.08)]'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <item.icon className="size-[18px]" strokeWidth={isActive ? 2.25 : 1.75} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/8 p-4">
          <Link
            href="/"
            className="text-[13px] text-white/40 transition-colors hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </aside>

      {/* Mobile top bar + bottom nav */}
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/8 bg-[#0c0c12]/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <Logo markSize="sm" />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/8 bg-[#0c0c12]/95 px-2 py-2 backdrop-blur-xl md:hidden">
        {items.slice(0, 5).map((item) => {
          const isActive = isItemActive(pathname, item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px]',
                isActive ? 'text-white' : 'text-white/40'
              )}
            >
              <item.icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
