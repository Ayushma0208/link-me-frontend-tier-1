'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, CreditCard, Shield, UserRound } from 'lucide-react'

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'

export function UserSettings() {
  const t = useTranslations('settings')

  const settings = [
    {
      title: t('account'),
      description: t('accountDesc'),
      href: '/user/settings/account',
      icon: UserRound,
    },
    {
      title: t('privacy'),
      description: t('privacyDesc'),
      href: '/user/profile',
      icon: Shield,
    },
    {
      title: t('billing'),
      description: t('billingDesc'),
      href: '/user/wallet',
      icon: CreditCard,
    },
    {
      title: t('notifications'),
      description: t('notificationsDesc'),
      href: '/user/notifications',
      icon: Bell,
    },
  ] as const

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7">
      <Link
        href="/user/profile"
        className="inline-flex items-center gap-2 text-[13px] text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('backToProfile')}
      </Link>

      <header className="space-y-1">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase"
        >
          {t('preferences')}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-extrabold tracking-tight text-white"
        >
          {t('title')}
        </motion.h1>
        <p className="text-[15px] text-white/45">{t('fanSubtitle')}</p>
      </header>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-4">
        <p className="text-[15px] font-semibold text-white">{t('languageSection')}</p>
        <p className="mt-1 text-[13px] text-white/40">{t('languageHint')}</p>
        <LanguageSwitcher className="mt-3" />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
        {settings.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.05] ${
              index !== settings.length - 1 ? 'border-b border-white/[0.06]' : ''
            }`}
          >
            <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
              <item.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-white">
                {item.title}
              </span>
              <span className="block text-[13px] text-white/40">
                {item.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
