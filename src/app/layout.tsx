import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import {
  DM_Sans,
  Geist,
  Instrument_Serif,
  Noto_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Devanagari,
  Space_Grotesk,
  Syne,
} from 'next/font/google'

import { Providers } from './providers'
import './globals.css'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { LOCALE_COOKIE, localeDir, resolveLocale } from '@/i18n/config'
import { getMessages } from '@/i18n/get-messages'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument',
})
const noto = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-noto',
})
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-ar',
})
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-hi',
})

export const metadata: Metadata = {
  applicationName: 'LinkMe',
  title: 'LinkMe',
  description: 'Creator platform with subscriptions, chat, and video calls',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LinkMe',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const messages = await getMessages(locale)
  const dir = localeDir(locale)

  return (
    <html
      lang={locale}
      dir={dir}
      className={cn(
        'dark font-sans',
        geist.variable,
        space.variable,
        dm.variable,
        syne.variable,
        instrument.variable,
        noto.variable,
        notoArabic.variable,
        notoDevanagari.variable
      )}
    >
      <body
        className={cn(
          locale === 'ar' && 'font-[family-name:var(--font-noto-ar)]',
          locale === 'hi' && 'font-[family-name:var(--font-noto-hi)]'
        )}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
          <OfflineBanner />
          <InstallPrompt />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
