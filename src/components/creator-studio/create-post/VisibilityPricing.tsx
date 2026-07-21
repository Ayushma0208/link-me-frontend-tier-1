'use client'

import { Crown, Globe2, Zap } from 'lucide-react'

import type { ContentVisibility } from '@/data/creator-studio'
import { cn, formatCurrency } from '@/lib/utils'

const OPTIONS: {
  id: ContentVisibility
  label: string
  description: string
  icon: typeof Globe2
}[] = [
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone can view this post',
    icon: Globe2,
  },
  {
    id: 'subscribers',
    label: 'Subscribers Only',
    description: 'Unlocked for members',
    icon: Crown,
  },
  {
    id: 'ppv',
    label: 'Pay Per View',
    description: 'Fans unlock with a one-time price',
    icon: Zap,
  },
]

export interface VisibilityPricingProps {
  visibility: ContentVisibility
  onVisibilityChange: (value: ContentVisibility) => void
  price: string
  onPriceChange: (value: string) => void
  className?: string
}

export function VisibilityPricing({
  visibility,
  onVisibilityChange,
  price,
  onPriceChange,
  className,
}: VisibilityPricingProps) {
  const parsed = Number(price) || 0

  return (
    <div className={cn('space-y-4', className)}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
        Post visibility
      </p>

      <div className="space-y-2.5">
        {OPTIONS.map((option) => {
          const active = visibility === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onVisibilityChange(option.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-[20px] border p-3.5 text-left transition',
                active
                  ? 'border-fuchsia-400/40 bg-fuchsia-500/12'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/16'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border',
                  active
                    ? 'border-fuchsia-400/30 bg-fuchsia-500/20 text-fuchsia-100'
                    : 'border-white/10 bg-white/[0.04] text-white/50'
                )}
              >
                <option.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-white">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[12px] text-white/40">
                  {option.description}
                </span>
              </span>
              <span
                className={cn(
                  'mt-1 size-4 shrink-0 rounded-full border-2',
                  active
                    ? 'border-fuchsia-300 bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.6)]'
                    : 'border-white/25'
                )}
              />
            </button>
          )
        })}
      </div>

      {visibility === 'ppv' ? (
        <label className="block space-y-2">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
            Pricing
          </span>
          <div className="relative">
            <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[14px] font-semibold text-white/40">
              ₹
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={(e) =>
                onPriceChange(e.target.value.replace(/[^0-9]/g, ''))
              }
              placeholder="Enter price"
              className="h-12 w-full rounded-2xl border border-amber-400/30 bg-amber-500/10 pr-3.5 pl-8 text-[16px] font-semibold text-white outline-none focus:border-amber-400/50"
            />
          </div>
          <p className="text-[12px] text-white/40">
            Fans pay {formatCurrency(parsed || 0)} once to unlock this post.
          </p>
        </label>
      ) : null}
    </div>
  )
}
