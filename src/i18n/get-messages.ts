import type { AppLocale } from './config'

const loaders: Record<AppLocale, () => Promise<{ default: IntlMessages }>> = {
  en: () => import('../messages/en.json'),
  hi: () => import('../messages/hi.json'),
  ar: () => import('../messages/ar.json'),
  pt: () => import('../messages/pt.json'),
  id: () => import('../messages/id.json'),
  es: () => import('../messages/es.json'),
}

export type IntlMessages = typeof import('../messages/en.json')

export async function getMessages(locale: AppLocale) {
  const mod = await loaders[locale]()
  return mod.default
}
