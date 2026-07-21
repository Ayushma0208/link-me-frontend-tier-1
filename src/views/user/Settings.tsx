'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, CreditCard, Shield, UserRound } from 'lucide-react'

const SETTINGS = [
  {
    title: 'Account',
    description: 'Update your username, password, and profile picture.',
    href: '/user/settings/account',
    icon: UserRound,
  },
  {
    title: 'Privacy',
    description: 'Control who can find and message you.',
    href: '/user/profile',
    icon: Shield,
  },
  {
    title: 'Billing',
    description: 'Wallet balance, payments, and invoices.',
    href: '/user/wallet',
    icon: CreditCard,
  },
  {
    title: 'Notifications',
    description: 'Choose which activity alerts you receive.',
    href: '/user/notifications',
    icon: Bell,
  },
] as const

export function UserSettings() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-7">
      <Link
        href="/user/profile"
        className="inline-flex items-center gap-2 text-[13px] text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to profile
      </Link>

      <header className="space-y-1">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase"
        >
          Preferences
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-extrabold tracking-tight text-white"
        >
          Settings
        </motion.h1>
        <p className="text-[15px] text-white/45">
          Manage your fan account, privacy, and billing.
        </p>
      </header>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
        {SETTINGS.map((item, index) => (
          <Link
            key={item.title}
            href={item.href}
            className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.05] ${
              index !== SETTINGS.length - 1 ? 'border-b border-white/[0.06]' : ''
            }`}
          >
            <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
              <item.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-white">
                {item.title}
              </span>
              <span className="block text-[13px] text-white/40">{item.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
