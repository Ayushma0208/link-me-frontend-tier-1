'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Crown } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import {
  equipEntryEffect,
  fetchLoyaltyStatus,
  purchaseEntryEffect,
  type LoyaltyStatus,
} from '@/lib/loyalty'
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
  if (tx.source === 'COFFEE' || tx.source === 'TIP' || tx.source === 'GIFT') {
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

  const { data: loyalty } = useQuery({
    queryKey: ['loyalty-status'],
    queryFn: fetchLoyaltyStatus,
  })

  const [entryFxError, setEntryFxError] = useState<string | null>(null)

  const entryFx = useMutation({
    mutationFn: async (input: { effectId: string; action: 'buy' | 'equip' }) => {
      setEntryFxError(null)
      if (input.action === 'buy') return purchaseEntryEffect(input.effectId)
      return equipEntryEffect(input.effectId)
    },
    onSuccess: async (status: LoyaltyStatus) => {
      queryClient.setQueryData(['loyalty-status'], status)
      await queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
      await queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
    },
    onError: (err) => {
      setEntryFxError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Entry effect update failed'
      )
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
        queryClient.invalidateQueries({ queryKey: ['loyalty-status'] }),
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

      {loyalty ? (
        <Card className="mb-8 border-amber-400/20 bg-gradient-to-br from-amber-600/15 to-yellow-700/10">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-200">
              <Crown className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-100">
                {loyalty.active ? 'King status' : 'Keep Your Crown'}
              </p>
              {loyalty.active ? (
                <>
                  <p className="mt-1 text-sm text-amber-50/80">
                    {loyalty.daysLeft != null
                      ? `${loyalty.daysLeft} day${loyalty.daysLeft === 1 ? '' : 's'} left`
                      : 'Active'}
                    {' · '}
                    {formatCurrency(loyalty.coinsToMaintain)} more to renew
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (loyalty.maintainSpend / loyalty.maintainTarget) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-amber-50/80">
                    Spend {formatCurrency(loyalty.coinsToUnlock)} more to unlock
                    King (golden name + live entrance)
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-amber-300/80"
                      style={{
                        width: `${Math.min(
                          100,
                          (loyalty.progressSpend / loyalty.unlockTarget) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </>
              )}

              <div className="mt-5 border-t border-amber-200/10 pt-4">
                <p className="text-xs font-semibold tracking-wide text-amber-100/70 uppercase">
                  Entry hype
                </p>
                <p className="mt-1 text-xs text-amber-50/60">
                  Equip a room-wide entrance when you join a live as King
                </p>
                <ul className="mt-3 space-y-2">
                  {(loyalty.effects ?? []).map((fx) => (
                    <li
                      key={fx.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {fx.label}
                        </p>
                        <p className="text-[11px] text-muted">
                          {fx.price <= 0
                            ? 'Free'
                            : formatCurrency(fx.price)}
                          {fx.equipped ? ' · Equipped' : fx.owned ? ' · Owned' : ''}
                        </p>
                      </div>
                      {fx.equipped ? (
                        <span className="shrink-0 rounded-full bg-amber-300/20 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                          Equipped
                        </span>
                      ) : fx.owned || fx.price <= 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={entryFx.isPending}
                          onClick={() =>
                            entryFx.mutate({
                              effectId: fx.id,
                              action: 'equip',
                            })
                          }
                        >
                          Equip
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={entryFx.isPending}
                          onClick={() =>
                            entryFx.mutate({
                              effectId: fx.id,
                              action: 'buy',
                            })
                          }
                        >
                          Buy
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
                {entryFxError ? (
                  <p className="mt-2 text-sm text-red-400">{entryFxError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

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
