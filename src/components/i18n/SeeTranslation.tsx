'use client'

import { useState } from 'react'
import { translateText } from '@/lib/post-engagement'
import { getClientLocale } from '@/lib/locale-cookie'
import { useAuthStore } from '@/stores/auth'
import { resolveLocale } from '@/i18n/config'
import { cn } from '@/lib/utils'

function canOfferTranslate(text: string, locale: string): boolean {
  const t = text.trim()
  if (!/[\p{L}\p{N}]/u.test(t)) return false
  if (locale === 'ar') return !/[\u0600-\u06FF]/.test(t)
  if (locale === 'hi') return !/[\u0900-\u097F]/.test(t)
  if (locale === 'en' || locale === 'pt' || locale === 'id') {
    return /[^\u0000-\u024F\s\d\p{P}\p{S}]/u.test(t)
  }
  return true
}

function norm(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ')
}

export function SeeTranslation({
  text,
  className,
  buttonClassName,
}: {
  text: string
  className?: string
  buttonClassName?: string
}) {
  const userLocale = useAuthStore((s) => s.user?.locale)
  const locale = resolveLocale(getClientLocale() || userLocale || 'en')
  const [translated, setTranslated] = useState<string | null>(null)
  const [showing, setShowing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!canOfferTranslate(text, locale)) return null

  async function toggle() {
    if (showing) {
      setShowing(false)
      return
    }
    if (translated) {
      setShowing(true)
      return
    }
    setBusy(true)
    setFailed(false)
    try {
      const res = await translateText(text, locale)
      const next = res.translatedText?.trim() ?? ''
      if (!next || norm(next) === norm(text)) {
        setTranslated(null)
        setShowing(false)
        setFailed(true)
        return
      }
      // Still same script as source when targeting English → treat as fail
      if (
        (locale === 'en' || locale === 'pt' || locale === 'id') &&
        /[\u0600-\u06FF]/.test(text) &&
        /[\u0600-\u06FF]/.test(next) &&
        !/[A-Za-z]/.test(next)
      ) {
        setTranslated(null)
        setShowing(false)
        setFailed(true)
        return
      }
      setTranslated(next)
      setShowing(true)
      setFailed(false)
    } catch {
      setTranslated(null)
      setShowing(false)
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cn('mt-1', className)}>
      {showing && translated ? (
        <p className="mb-1 rounded-md bg-sky-500/15 px-2 py-1.5 text-[13px] leading-snug text-sky-50">
          <span className="mb-0.5 block text-[10px] font-semibold tracking-wide text-sky-300 uppercase">
            Translated
          </span>
          {translated}
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void toggle()}
        className={cn(
          'text-[11px] font-semibold text-sky-300/90 transition hover:text-sky-200 disabled:opacity-50',
          buttonClassName
        )}
      >
        {busy
          ? 'Translating…'
          : failed
            ? 'Try translation again'
            : showing
              ? 'See original'
              : 'See translation'}
      </button>
    </div>
  )
}
