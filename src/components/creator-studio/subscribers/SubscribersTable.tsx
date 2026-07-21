'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

import type { StudioSubscriber, SubscriberStatus } from '@/data/creator-studio'
import { cn, formatCurrency } from '@/lib/utils'

function statusStyles(status: SubscriberStatus) {
  switch (status) {
    case 'active':
      return 'border-emerald-400/25 bg-emerald-500/15 text-emerald-200'
    case 'past_due':
      return 'border-amber-400/25 bg-amber-500/15 text-amber-100'
    case 'cancelled':
      return 'border-white/15 bg-white/10 text-white/55'
  }
}

function statusLabel(status: SubscriberStatus) {
  if (status === 'past_due') return 'Past due'
  return status[0]!.toUpperCase() + status.slice(1)
}

export interface SubscribersTableProps {
  rows: StudioSubscriber[]
  onOpen: (subscriber: StudioSubscriber) => void
}

export function SubscribersTable({ rows, onOpen }: SubscribersTableProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!rows.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-[14px] text-white/40">
        No subscribers match your filters.
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                <th className="px-5 py-3.5 font-semibold">Subscriber</th>
                <th className="px-4 py-3.5 font-semibold">Plan</th>
                <th className="px-4 py-3.5 font-semibold">Renewal</th>
                <th className="px-4 py-3.5 font-semibold">Amount</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.24) }}
                  onClick={() => onOpen(row)}
                  className="cursor-pointer border-b border-white/6 transition hover:bg-white/[0.04]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-full ring-1 ring-white/10">
                        <Image
                          src={row.avatar}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-white">
                          {row.name}
                        </p>
                        <p className="truncate text-[12px] text-white/35">
                          @{row.handle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12px] font-medium text-white/75">
                      {row.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-white/55">
                    {new Date(row.renewalDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-emerald-300">
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                        statusStyles(row.status)
                      )}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ChevronRight className="ml-auto size-4 text-white/30" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2.5 md:hidden">
        {rows.map((row, index) => (
          <motion.button
            key={row.id}
            type="button"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onOpen(row)}
            className="flex w-full items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5 text-left backdrop-blur-xl"
          >
            <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src={row.avatar}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[14px] font-semibold text-white">
                  {row.name}
                </p>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                    statusStyles(row.status)
                  )}
                >
                  {statusLabel(row.status)}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-white/40">
                {row.plan} · Renews{' '}
                {new Date(row.renewalDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <p className="mt-1 text-[13px] font-semibold text-emerald-300">
                {formatCurrency(row.amount)}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-white/30" />
          </motion.button>
        ))}
      </div>
    </>
  )
}
