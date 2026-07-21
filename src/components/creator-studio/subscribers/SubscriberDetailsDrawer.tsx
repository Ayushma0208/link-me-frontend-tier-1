'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CreditCard,
  History,
  MessageCircle,
  Send,
  X,
} from 'lucide-react'

import type { StudioSubscriber } from '@/data/creator-studio'
import { cn, formatCurrency } from '@/lib/utils'

export interface SubscriberDetailsDrawerProps {
  subscriber: StudioSubscriber | null
  open: boolean
  onClose: () => void
}

type DrawerTab = 'history' | 'payments' | 'messages'

export function SubscriberDetailsDrawer({
  subscriber,
  open,
  onClose,
}: SubscriberDetailsDrawerProps) {
  const prefersReducedMotion = useReducedMotion()
  const [tab, setTab] = useState<DrawerTab>('history')
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!open) return
    setTab('history')
    setDraft('')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, subscriber?.id])

  return (
    <AnimatePresence>
      {open && subscriber ? (
        <motion.div className="fixed inset-0 z-[80] flex justify-end">
          <motion.button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscriber-drawer-title"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { x: '100%', opacity: 0.8 }
            }
            animate={{ x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0c0c12]/95 shadow-[0_0_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/8 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-12 overflow-hidden rounded-2xl ring-1 ring-white/15">
                  <Image
                    src={subscriber.avatar}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h2
                    id="subscriber-drawer-title"
                    className="truncate text-[16px] font-bold text-white"
                  >
                    {subscriber.name}
                  </h2>
                  <p className="truncate text-[12px] text-white/40">
                    @{subscriber.handle} · {subscriber.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-white/8 px-5 py-4">
              {[
                { label: 'Plan', value: subscriber.plan },
                { label: 'Amount', value: formatCurrency(subscriber.amount) },
                {
                  label: 'Status',
                  value:
                    subscriber.status === 'past_due'
                      ? 'Past due'
                      : subscriber.status[0]!.toUpperCase() +
                        subscriber.status.slice(1),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                >
                  <p className="text-[10px] tracking-wide text-white/35 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-[13px] font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-1 border-b border-white/8 p-2">
              {(
                [
                  { id: 'history' as const, label: 'History', icon: History },
                  { id: 'payments' as const, label: 'Payments', icon: CreditCard },
                  { id: 'messages' as const, label: 'Messages', icon: MessageCircle },
                ] as const
              ).map((item) => {
                const active = tab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      'relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[12px] font-semibold transition',
                      active ? 'text-white' : 'text-white/40 hover:text-white/70'
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sub-drawer-tab"
                        className="absolute inset-0 rounded-xl bg-white/[0.08]"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    ) : null}
                    <item.icon className="relative size-3.5" />
                    <span className="relative hidden sm:inline">{item.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {tab === 'history' ? (
                <ul className="space-y-3">
                  {subscriber.history.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13px] font-medium text-white">
                          {item.label}
                        </p>
                        {item.amount != null ? (
                          <p className="shrink-0 text-[12px] font-semibold text-emerald-300">
                            {formatCurrency(item.amount)}
                          </p>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11px] text-white/35">{item.date}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {tab === 'payments' ? (
                <ul className="space-y-3">
                  {subscriber.payments.map((pay) => (
                    <li
                      key={pay.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3"
                    >
                      <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                        <CreditCard className="size-4 text-fuchsia-200" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-white">
                          {formatCurrency(pay.amount)}
                        </p>
                        <p className="text-[11px] text-white/35">
                          {pay.method} · {pay.date}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
                          pay.status === 'paid'
                            ? 'border-emerald-400/25 bg-emerald-500/15 text-emerald-200'
                            : pay.status === 'failed'
                              ? 'border-rose-400/25 bg-rose-500/15 text-rose-200'
                              : 'border-amber-400/25 bg-amber-500/15 text-amber-100'
                        )}
                      >
                        {pay.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {tab === 'messages' ? (
                <div className="flex h-full flex-col">
                  <ul className="flex-1 space-y-3">
                    {subscriber.messages.length === 0 ? (
                      <p className="py-8 text-center text-[13px] text-white/35">
                        No messages yet
                      </p>
                    ) : (
                      subscriber.messages.map((msg) => (
                        <li
                          key={msg.id}
                          className={cn(
                            'max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px]',
                            msg.from === 'creator'
                              ? 'ml-auto bg-gradient-to-br from-violet-500/25 to-fuchsia-500/20 text-white'
                              : 'border border-white/10 bg-white/[0.04] text-white/80'
                          )}
                        >
                          <p>{msg.body}</p>
                          <p className="mt-1 text-[10px] text-white/40">{msg.date}</p>
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="mt-4 flex gap-2 border-t border-white/8 pt-4">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a reply…"
                      className="h-11 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[13px] text-white outline-none focus:border-fuchsia-400/35"
                    />
                    <button
                      type="button"
                      className="inline-flex size-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                      aria-label="Send"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
