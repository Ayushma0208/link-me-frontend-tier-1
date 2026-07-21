'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Bell,
  ImagePlus,
  Plus,
  Search,
  Sparkles,
  CircleDot,
  UserRound,
} from 'lucide-react'

import { useAuthStore } from '@/stores/auth'
import { useCreatorPageStore } from '@/stores/creator-page'
import { cn } from '@/lib/utils'

const FALLBACK_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=Creator'

const CREATE_ACTIONS = [
  {
    label: 'Create post',
    description: 'Image, video, reel, or carousel',
    href: '/influencer/create/post',
    icon: ImagePlus,
  },
  {
    label: 'Upload story',
    description: '24-hour ephemeral',
    href: '/influencer/create?type=story',
    icon: CircleDot,
  },
  {
    label: 'Add highlight',
    description: 'Pin lasting stories',
    href: '/influencer/create?type=highlight',
    icon: Sparkles,
  },
  {
    label: 'Edit profile',
    description: 'Bio, cover, appearance',
    href: '/influencer/settings',
    icon: UserRound,
  },
]

export function CreatorTopNavbar() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const publicUsername = useCreatorPageStore((s) => s.claimedUsername)
  const username = user?.username || publicUsername || 'creator'
  const avatar = user?.avatar || FALLBACK_AVATAR

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const unread = 0

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CREATE_ACTIONS
    return CREATE_ACTIONS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setSearchOpen(false)
        setNotifOpen(false)
        setCreateOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0a0a10]/75 backdrop-blur-2xl">
      <div
        ref={wrapRef}
        className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8"
      >
        <div className="relative min-w-0 flex-1 md:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search studio…"
            className="h-10 w-full rounded-full border border-white/10 bg-white/[0.04] pr-4 pl-10 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/35"
          />
          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-[calc(100%+8px)] left-0 z-50 w-full overflow-hidden rounded-2xl border border-white/12 bg-[#12121a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
              >
                {results.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setQuery('')
                      router.push(item.href)
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.06]"
                  >
                    <item.icon className="size-4 text-fuchsia-200" />
                    <span>
                      <span className="block text-[13px] font-medium text-white">
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-white/40">
                        {item.description}
                      </span>
                    </span>
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <motion.button
              type="button"
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              onClick={() => {
                setCreateOpen((v) => !v)
                setNotifOpen(false)
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-3.5 text-[13px] font-semibold text-white shadow-[0_12px_32px_rgba(217,70,239,0.35)] sm:px-4"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Quick Create</span>
            </motion.button>
            <AnimatePresence>
              {createOpen ? (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-[calc(100%+8px)] right-0 z-50 w-64 overflow-hidden rounded-2xl border border-white/12 bg-[#12121a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                >
                  {CREATE_ACTIONS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setCreateOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.06]"
                    >
                      <item.icon className="size-4 text-fuchsia-200" />
                      <span>
                        <span className="block text-[13px] font-medium text-white">
                          {item.label}
                        </span>
                        <span className="block text-[11px] text-white/40">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setNotifOpen((v) => !v)
                setCreateOpen(false)
              }}
              className="relative flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute top-2 right-2 size-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
              ) : null}
            </button>
            <AnimatePresence>
              {notifOpen ? (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-[calc(100%+8px)] right-0 z-50 w-80 overflow-hidden rounded-2xl border border-white/12 bg-[#12121a]/95 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                >
                  <div className="border-b border-white/8 px-4 py-3">
                    <p className="text-[13px] font-semibold text-white">
                      Notifications
                    </p>
                  </div>
                  <ul className="max-h-72 overflow-y-auto p-2">
                    <li className="rounded-xl px-3 py-6 text-center text-[13px] text-white/40">
                      No notifications yet
                    </li>
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <Link
            href="/influencer/settings"
            className="relative size-10 overflow-hidden rounded-full border border-white/15 ring-2 ring-white/5 transition hover:scale-[1.03]"
            aria-label="Creator profile"
          >
            <Image src={avatar} alt="" fill sizes="40px" className="object-cover" unoptimized={avatar.includes('dicebear') || avatar.startsWith('data:')} />
          </Link>
        </div>
      </div>

      <p className="sr-only">Signed in as @{username}</p>
    </header>
  )
}
