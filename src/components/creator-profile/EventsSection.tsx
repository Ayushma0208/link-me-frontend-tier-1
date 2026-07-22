'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Bell, BellOff, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import type { PublicEvent } from '@/data/public-creator'
import { ApiError } from '@/lib/api'
import { notifyMeLive, unnotifyMeLive } from '@/lib/live'
import { formatCountdownShort } from '@/lib/premiere-countdown'
import { cn } from '@/lib/utils'

export interface EventsSectionProps {
  events: PublicEvent[]
  className?: string
}

function partsFromEvent(event: PublicEvent) {
  const raw = event.startsAt || event.dateLabel
  const date = raw ? new Date(raw) : null
  if (date && !Number.isNaN(date.getTime())) {
    return {
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: String(date.getDate()),
      year: String(date.getFullYear()),
    }
  }
  // Fallback when only a label like "Sat · 8:00 PM" exists
  return {
    month: 'TBA',
    day: '—',
    year: '',
  }
}

function TicketCard({
  event,
  index,
  prefersReducedMotion,
}: {
  event: PublicEvent
  index: number
  prefersReducedMotion: boolean | null
}) {
  const { month, day, year } = partsFromEvent(event)
  const isLive = event.kind === 'LIVE'
  const isScheduled =
    isLive &&
    event.liveStatus !== 'LIVE' &&
    event.liveStatus !== 'ENDED' &&
    Boolean(event.liveId)
  const liveHref = event.liveId
    ? `/live/${event.liveId}`
    : event.ticketUrl || '#'
  const ticketHref = event.ticketUrl || '#'
  const ctaLabel = isLive
    ? event.liveStatus === 'LIVE'
      ? 'Join'
      : 'Details'
    : 'Tickets'

  const [notifyMe, setNotifyMe] = useState(false)
  const [notifyBusy, setNotifyBusy] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!isScheduled) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [isScheduled])

  async function toggleNotify() {
    if (!event.liveId || notifyBusy) return
    setNotifyBusy(true)
    try {
      const res = notifyMe
        ? await unnotifyMeLive(event.liveId)
        : await notifyMeLive(event.liveId)
      setNotifyMe(Boolean(res.notifyMe))
    } catch (err) {
      console.error(
        err instanceof ApiError ? err.message : 'Notify Me failed',
        err
      )
    } finally {
      setNotifyBusy(false)
    }
  }

  const ctaClass =
    'inline-flex h-8 w-fit items-center justify-center rounded-full border border-white/40 px-4 text-[12px] font-medium text-white transition hover:bg-white hover:text-black'

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="relative flex min-h-[112px] overflow-hidden rounded-2xl bg-[#1a1a1a]"
    >
      {/* Ticket notches */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 -left-2.5 z-10 size-5 -translate-y-1/2 rounded-full bg-black"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 -right-2.5 z-10 size-5 -translate-y-1/2 rounded-full bg-black"
      />

      {/* Date stub */}
      <div className="relative flex w-[72px] shrink-0 flex-col items-center justify-center border-r border-dashed border-white/15 px-2 py-3 sm:w-[80px]">
        <p className="text-[11px] font-medium tracking-wide text-white/45">
          {month}
        </p>
        <p className="mt-0.5 text-[28px] leading-none font-bold text-white sm:text-[32px]">
          {day}
        </p>
        {year ? (
          <p className="mt-1 text-[11px] text-white/40">{year}</p>
        ) : null}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 px-3.5 py-3.5 sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[14px] font-semibold text-white sm:text-[15px]">
              {event.title}
            </h3>
            {isLive ? (
              <span
                className={cn(
                  'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                  event.liveStatus === 'LIVE'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white/10 text-rose-200'
                )}
              >
                {event.liveStatus === 'LIVE'
                  ? 'Live'
                  : isScheduled
                    ? formatCountdownShort(event.startsAt ?? null)
                    : 'Soon'}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-[12px] text-white/45">
            {event.location}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isLive ? (
            <Link href={liveHref} className={ctaClass}>
              {ctaLabel}
            </Link>
          ) : (
            <a
              href={ticketHref}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaClass}
            >
              {ctaLabel}
            </a>
          )}
          {isScheduled ? (
            <button
              type="button"
              disabled={notifyBusy}
              onClick={() => void toggleNotify()}
              className={cn(
                'inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12px] font-medium transition disabled:opacity-50',
                notifyMe
                  ? 'border border-white/30 text-white'
                  : 'bg-white text-black hover:bg-white/90'
              )}
            >
              {notifyBusy ? (
                <Loader2 className="size-3 animate-spin" />
              ) : notifyMe ? (
                <BellOff className="size-3" />
              ) : (
                <Bell className="size-3" />
              )}
              {notifyMe ? 'Reminded' : 'Notify Me'}
            </button>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

export function EventsSection({ events, className }: EventsSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    function update() {
      if (!el) return
      setCanLeft(el.scrollLeft > 4)
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [events.length])

  if (!events.length) return null

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <section className={cn('space-y-4', className)} aria-label="All Events">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-bold tracking-tight text-white">
          All Events
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous events"
            disabled={!canLeft}
            onClick={() => scrollByDir(-1)}
            className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next events"
            disabled={!canRight}
            onClick={() => scrollByDir(1)}
            className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:auto-cols-[minmax(280px,calc(50%-6px))] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event, index) => (
          <TicketCard
            key={event.id}
            event={event}
            index={index}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
    </section>
  )
}
