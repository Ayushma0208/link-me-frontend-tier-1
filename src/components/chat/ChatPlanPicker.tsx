'use client'

import { X } from 'lucide-react'
import {
  planModeLabel,
  planSummary,
  type ChatPlan,
} from '@/lib/chat-plans'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  creatorName: string
  plans: ChatPlan[]
  selectedId: string | null
  busy?: boolean
  error?: string | null
  onSelect: (plan: ChatPlan) => void
  onConfirm: () => void
  onClose: () => void
}

function upfrontAmount(plan: ChatPlan) {
  if (plan.mode === 'FIXED_DURATION') return Number(plan.packagePrice ?? 0) || 0
  if (plan.mode === 'PER_MINUTE') {
    return Math.max(Number(plan.pricePerMinute ?? 0) || 0, 0) * 2
  }
  const prices = [
    Number(plan.textPrice ?? 0) || 0,
    Number(plan.imagePrice ?? 0) || 0,
    Number(plan.audioPrice ?? 0) || 0,
  ].filter((n) => n > 0)
  return prices.length ? Math.min(...prices) : 0
}

export function ChatPlanPicker({
  open,
  creatorName,
  plans,
  selectedId,
  busy,
  error,
  onSelect,
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null
  const selected = plans.find((p) => p.id === selectedId) ?? null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/12 bg-[#121218] p-5 sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Choose a chat plan</h2>
            <p className="mt-1 text-[13px] text-white/45">
              Message {creatorName} with a package, per-minute, or per-message plan.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="size-5 text-white/50" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {plans.map((plan) => {
            const active = plan.id === selectedId
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelect(plan)}
                className={cn(
                  'w-full rounded-2xl border px-4 py-3 text-left transition',
                  active
                    ? 'border-fuchsia-400/50 bg-fuchsia-500/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">
                    {planModeLabel(plan.mode)}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {plan.mode === 'FIXED_DURATION'
                      ? formatCurrency(Number(plan.packagePrice ?? 0))
                      : plan.mode === 'PER_MINUTE'
                        ? `${formatCurrency(Number(plan.pricePerMinute ?? 0))}/min`
                        : 'Pay as you go'}
                  </p>
                </div>
                <p className="mt-1 text-[12px] text-white/50">{planSummary(plan)}</p>
              </button>
            )
          })}
        </div>

        {selected ? (
          <p className="mt-4 text-[12px] text-white/45">
            {selected.mode === 'PER_MINUTE'
              ? `Wallet hold starts at about ${formatCurrency(upfrontAmount(selected))} (2 minutes).`
              : selected.mode === 'FIXED_DURATION'
                ? `You'll be charged ${formatCurrency(upfrontAmount(selected))} now. Timer starts on your first message.`
                : 'Each text, image, and voice note is charged when you send it.'}
          </p>
        ) : null}

        {error ? <p className="mt-3 text-[13px] text-rose-400">{error}</p> : null}

        <Button
          className="mt-5 w-full"
          disabled={!selected || busy}
          onClick={onConfirm}
        >
          {busy ? 'Starting…' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
