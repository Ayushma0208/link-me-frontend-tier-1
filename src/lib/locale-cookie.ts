import {
  LOCALE_COOKIE,
  resolveLocale,
  type AppLocale,
} from '@/i18n/config'

export function getClientLocale(): AppLocale {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
  const value = match?.split('=')[1]
  return resolveLocale(value ? decodeURIComponent(value) : null)
}

export function setLocaleCookie(locale: AppLocale) {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${maxAge}; samesite=lax`
}
