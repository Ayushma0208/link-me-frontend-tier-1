export const APP_LOCALES = ['en', 'hi', 'ar', 'pt', 'id', 'es'] as const
export type AppLocale = (typeof APP_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'en'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ar: 'العربية',
  pt: 'Português',
  id: 'Bahasa Indonesia',
  es: 'Español',
}

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return !!value && (APP_LOCALES as readonly string[]).includes(value)
}

export function resolveLocale(value?: string | null): AppLocale {
  if (!value) return DEFAULT_LOCALE
  const normalized = value.trim().toLowerCase().split('-')[0] ?? ''
  return isAppLocale(normalized) ? normalized : DEFAULT_LOCALE
}

export function localeDir(locale: AppLocale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
