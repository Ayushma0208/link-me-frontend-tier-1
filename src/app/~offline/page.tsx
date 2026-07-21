import type { Metadata } from 'next'
import { LogoMark } from '@/components/layout/Logo'

export const metadata: Metadata = {
  title: "You're offline · LinkMe",
}

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <LogoMark size="lg" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          You&apos;re offline
        </h1>
        <p className="max-w-sm text-sm text-white/60">
          We couldn&apos;t load this page because there&apos;s no internet
          connection. Check your network and try again.
        </p>
      </div>
      <p className="text-xs text-white/40">
        Some pages you&apos;ve already visited may still work offline.
      </p>
    </main>
  )
}
