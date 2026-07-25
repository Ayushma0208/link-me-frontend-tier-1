import type { IntlMessages } from '@/i18n/get-messages'

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'en' | 'hi' | 'ar' | 'pt' | 'id' | 'es'
    Messages: IntlMessages
  }
}
