'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarClock, Loader2, Radio } from 'lucide-react'
import {
  listActiveLives,
  listUpcomingLives,
  type LiveDto,
} from '@/lib/live'
import { formatCurrency } from '@/lib/utils'

function avatarFor(live: LiveDto) {
  return (
    live.creator?.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(live.creator?.username ?? 'c')}`
  )
}

function whenLabel(iso: string | null): string {
  if (!iso) return 'Scheduled'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Scheduled'
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function UserLivePage() {
  const [items, setItems] = useState<LiveDto[]>([])
  const [upcoming, setUpcoming] = useState<LiveDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const [active, soon] = await Promise.all([
        listActiveLives().catch(() => [] as LiveDto[]),
        listUpcomingLives().catch(() => [] as LiveDto[]),
      ])
      if (cancelled) return
      setItems(Array.isArray(active) ? active : [])
      setUpcoming(Array.isArray(soon) ? soon : [])
    }

    void load().finally(() => {
      if (!cancelled) setLoading(false)
    })
    const interval = setInterval(() => void load(), 8000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
          Now
        </p>
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          <span className="relative flex size-10 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15">
            <Radio className="size-5 text-rose-300" />
          </span>
          Live
        </h1>
        <p className="max-w-md text-[14px] text-white/45">
          Creators you subscribe to who are live right now — plus what&apos;s
          coming up.
        </p>
      </header>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center text-white/50">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : items.length === 0 && upcoming.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <p className="text-lg font-semibold text-white">No one is live</p>
          <p className="mt-1 max-w-sm text-[14px] text-white/40">
            When a creator you subscribe to goes live or schedules one,
            they&apos;ll show up here — and you&apos;ll get a notification.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.length > 0 ? (
            <section className="space-y-3">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-rose-300/80 uppercase">
                Live now
              </p>
              {items.map((live) => (
                <Link
                  key={live.id}
                  href={`/live/${live.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 transition hover:border-rose-400/30 hover:bg-white/[0.07]"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl ring-2 ring-rose-400/50">
                    <Image
                      src={avatarFor(live)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      Live
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-white">
                      {live.creator?.name ?? 'Creator'}
                    </p>
                    <p className="truncate text-[13px] text-white/50">
                      {live.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-white/35">
                      {live.accessType === 'PAID'
                        ? `Paid · ${formatCurrency(live.price ?? 0)}`
                        : 'Free for subscribers'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#07070b]">
                    Join
                  </span>
                </Link>
              ))}
            </section>
          ) : null}

          {upcoming.length > 0 ? (
            <section className="space-y-3">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase">
                Upcoming
              </p>
              {upcoming.map((live) => (
                <Link
                  key={live.id}
                  href={`/live/${live.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <Image
                      src={avatarFor(live)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      <CalendarClock className="size-2.5" />
                      Soon
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-white">
                      {live.creator?.name ?? 'Creator'}
                    </p>
                    <p className="truncate text-[13px] text-white/50">
                      {live.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-white/35">
                      {whenLabel(live.scheduledAt)} ·{' '}
                      {live.accessType === 'PAID'
                        ? `Paid · ${formatCurrency(live.price ?? 0)}`
                        : 'Free for subscribers'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/15 px-3.5 py-1.5 text-[12px] font-bold text-white/80">
                    Details
                  </span>
                </Link>
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
