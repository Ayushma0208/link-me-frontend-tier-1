'use client'

import { Download, Share, X } from 'lucide-react'
import { useState } from 'react'

import { LogoMark } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import { usePwaInstall } from '@/lib/hooks/use-pwa-install'
import { cn } from '@/lib/utils'

export function InstallPrompt({ className }: { className?: string }) {
  const { canPrompt, canShowIosHint, install, dismiss } = usePwaInstall()
  const [iosOpen, setIosOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  if (!canPrompt && !canShowIosHint) return null

  const onInstall = async () => {
    if (canShowIosHint) {
      setIosOpen(true)
      return
    }
    setInstalling(true)
    try {
      await install()
    } finally {
      setInstalling(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-x-0 bottom-20 z-[60] px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bottom-4 md:left-auto md:right-4 md:w-[360px] md:px-0 md:pb-0',
          className
        )}
      >
        <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#12121a]/95 p-3.5 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <LogoMark size="md" className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white">Install LinkMe</p>
            <p className="mt-0.5 text-[12px] leading-snug text-white/55">
              Add to your home screen for a faster, app-like experience.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 rounded-full bg-white px-3.5 text-black hover:bg-white/90"
                disabled={installing}
                onClick={onInstall}
              >
                <Download className="size-3.5" />
                {canShowIosHint ? 'How to install' : installing ? 'Installing…' : 'Install'}
              </Button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-2.5 py-1.5 text-[12px] text-white/45 transition-colors hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={dismiss}
            className="rounded-full p-1 text-white/35 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {iosOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          onClick={() => setIosOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#12121a] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <LogoMark size="md" />
              <h2 id="ios-install-title" className="text-[15px] font-semibold text-white">
                Install on iPhone
              </h2>
            </div>
            <ol className="mt-4 space-y-3 text-[13px] text-white/70">
              <li className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
                  1
                </span>
                <span>
                  Tap the <Share className="mx-0.5 inline size-3.5 align-text-bottom" /> Share
                  button in Safari
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
                  2
                </span>
                <span>
                  Scroll and tap <strong className="text-white">Add to Home Screen</strong>
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">Add</strong> — LinkMe opens like an app
                </span>
              </li>
            </ol>
            <Button
              type="button"
              className="mt-5 w-full rounded-full"
              onClick={() => {
                setIosOpen(false)
                dismiss()
              }}
            >
              Got it
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}
