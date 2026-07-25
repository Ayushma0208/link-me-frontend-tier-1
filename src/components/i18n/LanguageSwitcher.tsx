'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import {
  APP_LOCALES,
  LOCALE_LABELS,
  type AppLocale,
} from '@/i18n/config'
import { api } from '@/lib/api'
import { setLocaleCookie } from '@/lib/locale-cookie'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

type LanguageSwitcherProps = {
  className?: string
  compact?: boolean
}

export function LanguageSwitcher({
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const t = useTranslations('common')
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [pending, startTransition] = useTransition()

  async function onChange(next: AppLocale) {
    if (next === locale) return
    setLocaleCookie(next)
    if (user) {
      try {
        const data = await api<{ user: { locale?: string } }>('/auth/me', {
          method: 'PATCH',
          body: JSON.stringify({ locale: next }),
        })
        setUser({ ...user, locale: data.user.locale ?? next })
      } catch {
        // cookie still applied for UI
      }
    }
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <label
      className={cn(
        'flex items-center gap-2',
        compact ? 'text-[12px]' : 'text-sm',
        className
      )}
    >
      {!compact ? (
        <span className="shrink-0 text-white/45">{t('language')}</span>
      ) : null}
      <select
        value={locale}
        disabled={pending}
        aria-label={t('language')}
        onChange={(e) => void onChange(e.target.value as AppLocale)}
        className={cn(
          'rounded-full border border-white/12 bg-white/[0.06] text-white outline-none',
          'focus-visible:ring-2 focus-visible:ring-fuchsia-400/40',
          compact ? 'h-8 px-2.5 text-[11px]' : 'h-10 px-3 text-[13px]',
          pending && 'opacity-60'
        )}
      >
        {APP_LOCALES.map((code) => (
          <option key={code} value={code} className="bg-[#12121a] text-white">
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  )
}
