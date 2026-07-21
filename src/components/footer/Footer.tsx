import Link from 'next/link'

import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Creators', href: '#creators' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'Help center', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
]

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t border-white/10 bg-black', className)}>
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" aria-label="Linkme home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              The premium link in bio for creators who sell courses, merch, tips, and access.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <p className="text-[12px] font-semibold tracking-[0.12em] text-white/40 uppercase">
                  {group.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Linkme. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm text-white/45">
            <Link href="/login" className="hover:text-white">
              Log In
            </Link>
            <Link href="/signup" className="hover:text-white">
              Start for free
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
