'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { PublicEvent } from '@/data/public-creator'
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
  const liveHref = event.liveId
    ? `/live/${event.liveId}`
    : event.ticketUrl || '#'
  const ticketHref = event.ticketUrl || '#'
  const ctaLabel = isLive
    ? event.liveStatus === 'LIVE'
      ? 'Join'
      : 'Details'
    : 'Tickets'

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
                {event.liveStatus === 'LIVE' ? 'Live' : 'Soon'}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-[12px] text-white/45">
            {event.location}
          </p>
        </div>
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
