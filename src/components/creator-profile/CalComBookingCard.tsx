'use client'

import { useEffect, useState } from 'react'
import { Calendar, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ProfileAppearance } from '@/lib/profile-appearance'

interface CalComBookingCardProps {
  creatorName: string
  bookingUrl: string
  appearance: ProfileAppearance
}

/** Turn a Cal.com link into an embeddable URL. */
export function toCalComEmbedUrl(bookingUrl: string): string | null {
  try {
    const url = new URL(bookingUrl.trim())
    const host = url.hostname.toLowerCase()
    if (host !== 'cal.com' && !host.endsWith('.cal.com')) return null
    url.searchParams.set('embed', 'true')
    url.searchParams.set('theme', 'dark')
    return url.toString()
  } catch {
    return null
  }
}

export function CalComBookingCard({
  creatorName,
  bookingUrl,
  appearance,
}: CalComBookingCardProps) {
  const [open, setOpen] = useState(false)
  const embedUrl = toCalComEmbedUrl(bookingUrl)
  const isLight = appearance.theme === 'light'

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const openCalendar = () => {
    if (embedUrl) {
      setOpen(true)
      return
    }
    window.open(bookingUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <section
        className={cn(
          'flex items-center gap-3 rounded-2xl border px-3.5 py-3 sm:gap-4 sm:px-4',
          isLight
            ? 'border-black/8 bg-white text-zinc-900 shadow-sm'
            : 'border-white/10 bg-white/[0.04] text-white'
        )}
      >
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${appearance.accent}22` }}
        >
          <Calendar
            className="size-5"
            style={{ color: appearance.accent }}
            aria-hidden
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.14em] opacity-45 uppercase">
            Book a time
          </p>
          <h2 className="truncate text-[14px] font-semibold tracking-tight sm:text-[15px]">
            Schedule with {creatorName}
          </h2>
          <p
            className={cn(
              'mt-0.5 hidden text-[12px] leading-snug sm:block',
              isLight ? 'text-zinc-500' : 'text-white/50'
            )}
          >
            Meetings, shoots & collab calls · timezone auto
          </p>
        </div>

        <button
          type="button"
          onClick={openCalendar}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 sm:h-10 sm:px-4 sm:text-[13px]"
          style={{ backgroundColor: appearance.accent }}
        >
          <Calendar className="size-3.5" aria-hidden />
          Choose time
        </button>
      </section>

      {open && embedUrl ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cal-booking-title"
          onClick={() => setOpen(false)}
        >
          <div
            className={cn(
              'flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] border shadow-2xl sm:rounded-[24px]',
              isLight
                ? 'border-black/10 bg-white'
                : 'border-white/10 bg-[#0c0c12]'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                'flex items-center justify-between gap-3 border-b px-4 py-3',
                isLight ? 'border-black/8' : 'border-white/8'
              )}
            >
              <div className="min-w-0">
                <p
                  id="cal-booking-title"
                  className={cn(
                    'truncate text-[14px] font-semibold',
                    isLight ? 'text-zinc-900' : 'text-white'
                  )}
                >
                  Book with {creatorName}
                </p>
                <p
                  className={cn(
                    'text-[12px]',
                    isLight ? 'text-zinc-500' : 'text-white/45'
                  )}
                >
                  Select a meeting type
                </p>
              </div>
              <button
                type="button"
                aria-label="Close calendar"
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-full p-2 transition-colors',
                  isLight
                    ? 'text-zinc-400 hover:bg-black/5 hover:text-zinc-900'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                )}
              >
                <X className="size-4" />
              </button>
            </div>
            <iframe
              title={`Book a call with ${creatorName}`}
              src={embedUrl}
              className="h-[min(640px,75vh)] w-full border-0 bg-transparent"
              loading="lazy"
              allow="camera; microphone; fullscreen"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
