import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'
import {
  DM_Sans,
  Geist,
  Instrument_Serif,
  Space_Grotesk,
  Syne,
} from 'next/font/google'
import { cn } from '@/lib/utils'
import { OfflineBanner } from '@/components/pwa/OfflineBanner'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        'dark font-sans',
        geist.variable,
        space.variable,
        dm.variable,
        syne.variable,
        instrument.variable
      )}
    >
      <body>
        <Providers>{children}</Providers>
        <OfflineBanner />
        <InstallPrompt />
      </body>
    </html>
  )
}
