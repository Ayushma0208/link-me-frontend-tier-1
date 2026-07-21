'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import { topUpWallet } from '@/lib/razorpay-checkout'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface WalletBalance {
  walletId: string
  availableBalance: string
  pendingBalance: string
  currency: string
}

interface WalletTx {
  id: string
  type: string
  source: string
  amount: string
  currency: string
  description: string | null
  activityType: 'VIDEO_CALL' | 'VOICE_CALL' | 'MESSAGE' | 'CHAT' | null
  creator: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  } | null
  createdAt: string
}

const QUICK_AMOUNTS = [100, 200, 500, 1000]

function localDateKey(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function dateSectionLabel(value: string) {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (localDateKey(value) === localDateKey(today.toISOString())) return 'Today'
  if (localDateKey(value) === localDateKey(yesterday.toISOString())) {
    return 'Yesterday'
  }
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

function isReturnedHold(tx: WalletTx) {
  const description = tx.description?.toLowerCase() ?? ''
  return (
    tx.type.toUpperCase() === 'RELEASE' &&
    (description.includes('hold release') ||
      description.includes('release hold') ||
      description.includes('returned'))
  )
}

function isActualSpend(tx: WalletTx) {
  const type = tx.type.toUpperCase()
  return type === 'DEBIT' || (type === 'RELEASE' && !isReturnedHold(tx))
}

function transactionTitle(tx: WalletTx) {
  const handle = tx.creator?.username ? `@${tx.creator.username}` : null
  if (tx.activityType === 'VIDEO_CALL') {
    return handle ? `Video call with ${handle}` : 'Video call'
  }
  if (tx.activityType === 'VOICE_CALL') {
    return handle ? `Voice call with ${handle}` : 'Voice call'
  }
  if (tx.activityType === 'MESSAGE') {
    return handle ? `Message to ${handle}` : 'Paid message'
  }
  if (tx.activityType === 'CHAT') {
    return handle ? `Chat with ${handle}` : 'Paid chat'
  }
  if (tx.source === 'TOPUP') return 'Wallet top-up'
  if (tx.source === 'SUBSCRIPTION') {
    return handle ? `Subscription to ${handle}` : 'Creator subscription'
  }
  if (tx.source === 'PPV') {
    return handle ? `Post from ${handle}` : 'Exclusive post'
  }
  if (tx.source === 'COFFEE' || tx.source === 'TIP') {
    return handle ? `Support for ${handle}` : 'Creator support'
  }
  return tx.description || (tx.type === 'CREDIT' ? 'Wallet credit' : 'Purchase')
}

function amountPresentation(tx: WalletTx) {
  const type = tx.type.toUpperCase()
  if (type === 'CREDIT' || isReturnedHold(tx)) {
    return { prefix: '+', className: 'text-green-400' }
  }
  if (type === 'HOLD') {
    return { prefix: 'Held ', className: 'text-amber-300' }
  }
  return { prefix: '-', className: 'text-red-400' }
}

export function UserWallet() {
  const [topupAmount, setTopupAmount] = useState(100)
  const [topupError, setTopupError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const res = await api<{ wallet: WalletBalance }>('/wallet')
      return res.wallet
    },
  })

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const res = await api<{ items: WalletTx[] }>('/wallet/transactions')
      return Array.isArray(res?.items) ? res.items : []
    },
  })

  const topup = useMutation({
    mutationFn: async (amount: number) => {
      setTopupError(null)
      return topUpWallet(amount)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['wallet-balance'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] }),
      ])
    },
    onError: (err) => {
      setTopupError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Top-up failed'
      )
    },
  })

  const balance = Number(wallet?.availableBalance ?? 0)
  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, WalletTx[]>()
    for (const transaction of transactions) {
      const key = localDateKey(transaction.createdAt)
      const current = groups.get(key)
      if (current) current.push(transaction)
      else groups.set(key, [transaction])
    }
    return Array.from(groups.values())
  }, [transactions])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted">
          Add funds for chat messages and voice/video calls
        </p>
      </div>

      <Card className="mb-8 bg-gradient-to-br from-green-600/20 to-teal-600/20">
        <p className="text-sm text-muted">Wallet Balance</p>
        <p className="mt-2 text-4xl font-bold">
          {walletLoading ? '…' : formatCurrency(balance)}
        </p>
        <p className="mt-2 text-xs text-muted">
          Messages and calls are deducted from this balance. You cannot chat or
          call when funds are too low.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setTopupAmount(amt)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                topupAmount === amt
                  ? 'border-brand-500 bg-brand-500/20 text-white'
                  : 'border-border text-muted hover:border-white/30'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={50}
            value={topupAmount}
            onChange={(e) => setTopupAmount(Number(e.target.value))}
            className="w-28 rounded-xl border border-border bg-surface px-3 py-2"
          />
          <Button
            onClick={() => topup.mutate(topupAmount)}
            disabled={topup.isPending || topupAmount < 50}
          >
            {topup.isPending ? 'Processing…' : `Add ₹${topupAmount}`}
          </Button>
        </div>
        {topupError ? (
          <p className="mt-3 text-sm text-red-400">{topupError}</p>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent wallet activity</CardDescription>
        </CardHeader>
        <div className="space-y-6">
          {txLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted">No transactions yet</p>
          ) : (
            groupedTransactions.map((group) => {
              const spent = group.reduce(
                (total, tx) =>
                  total + (isActualSpend(tx) ? Number(tx.amount) || 0 : 0),
                0
              )
              return (
                <section key={localDateKey(group[0].createdAt)}>
                  <div className="mb-2 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {dateSectionLabel(group[0].createdAt)}
                      </h3>
                      <p className="text-xs text-muted">
                        {group.length} transaction{group.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    {spent > 0 ? (
                      <p className="text-xs text-muted">
                        Spent{' '}
                        <span className="font-semibold text-red-300">
                          {formatCurrency(spent)}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    {group.map((tx) => {
                      const amount = Number(tx.amount)
                      const presentation = amountPresentation(tx)
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-white/70">
                              {tx.creator?.displayName?.charAt(0).toUpperCase() ||
                                tx.source.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {transactionTitle(tx)}
                              </p>
                              <p className="truncate text-xs text-muted">
                                {tx.creator?.displayName
                                  ? `${tx.creator.displayName} · `
                                  : ''}
                                {tx.description || tx.source.toLowerCase()}
                                {' · '}
                                {new Date(tx.createdAt).toLocaleTimeString(
                                  undefined,
                                  {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 text-sm font-semibold ${presentation.className}`}
                          >
                            {presentation.prefix}
                            {formatCurrency(
                              Number.isFinite(amount) ? amount : 0
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
