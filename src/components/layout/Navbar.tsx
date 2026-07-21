'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#product-demo', label: 'People' },
  { href: '#business', label: 'Business' },
  { href: '#agencies', label: 'Agencies' },
  { href: '#hospitality', label: 'Hospitality' },
] as const

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled && 'border-white/8 bg-black/65 backdrop-blur-xl'
      )}
    >
      <div className="relative mx-auto flex max-w-[1320px] items-center justify-between px-5 pt-8 pb-5 sm:px-8 lg:px-16">
        <Link
          href="/"
          className="relative z-10 shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Linkme home"
        >
          <Logo />
        </Link>

        <nav
          className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 lg:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium tracking-[-0.01em] text-white transition-opacity hover:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 hidden items-center gap-5 md:flex">
          <Link
            href="/login"
            className="text-[15px] font-medium tracking-[-0.01em] text-white transition-opacity hover:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Log In
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
              render={<Link href="/signup" />}
              className="h-12 rounded-[9999px] bg-white px-6 text-[15px] font-semibold tracking-[-0.01em] text-black shadow-none hover:bg-neutral-100"
            >
              Start for free
            </Button>
          </motion.div>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="relative z-10 text-white hover:bg-white/10 md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>

          <SheetContent side="right" className="w-full max-w-xs border-white/10 bg-black text-white">
            <SheetHeader>
              <SheetTitle className="text-left text-white">Menu</SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 border-t border-white/10 p-4">
              <Button
                variant="outline"
                className="h-11 w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                render={<Link href="/login" onClick={() => setMobileOpen(false)} />}
              >
                Log In
              </Button>
              <Button
                className="h-11 w-full rounded-full bg-white font-semibold text-black hover:bg-neutral-100"
                render={<Link href="/signup" onClick={() => setMobileOpen(false)} />}
              >
                Start for free
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  )
}
