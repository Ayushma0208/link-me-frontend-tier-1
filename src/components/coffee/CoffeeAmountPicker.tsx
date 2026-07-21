'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Coffee } from 'lucide-react'

import { cn, formatCurrency } from '@/lib/utils'

const PRESETS = [1, 3, 5] as const

export interface CoffeeAmountPickerProps {
  unitPrice: number
  coffeeCount: number
  customAmount: number | null
  onSelectPreset: (count: number) => void
  onSelectCustom: (amount: number | null) => void
  className?: string
}

export function CoffeeAmountPicker({
  unitPrice,
  coffeeCount,
  customAmount,
  onSelectPreset,
  onSelectCustom,
  className,
}: CoffeeAmountPickerProps) {
  const prefersReducedMotion = useReducedMotion()
  const customActive = customAmount != null

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
        Support amount
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {PRESETS.map((count, index) => {
          const active = !customActive && coffeeCount === count
          return (
            <motion.button
              key={count}
              type="button"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={prefersReducedMotion ? undefined : { y: -3 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              onClick={() => onSelectPreset(count)}
              className={cn(
                'relative overflow-hidden rounded-[20px] border px-2 py-3.5 text-center transition',
                active
                  ? 'border-amber-400/45 bg-amber-500/15 shadow-[0_0_28px_rgba(245,158,11,0.22)]'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/18'
              )}
            >
              {active ? (
                <motion.span
                  layoutId="coffee-amount-glow"
                  className="absolute inset-0 bg-gradient-to-br from-amber-400/15 to-transparent"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative flex items-center justify-center gap-0.5 text-amber-100">
                {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                  <Coffee
                    key={i}
                    className={cn('size-3.5', count === 5 && i === 2 && 'opacity-70')}
                    aria-hidden
                  />
                ))}
                {count === 5 ? (
                  <span className="ml-0.5 text-[10px] font-bold text-amber-200/80">
                    ×5
                  </span>
                ) : null}
              </span>
              <span className="relative mt-2 block text-[13px] font-semibold text-white">
                {count} Coffee{count > 1 ? 's' : ''}
              </span>
              <span className="relative mt-0.5 block text-[12px] font-bold tabular-nums text-amber-100/80">
                {formatCurrency(unitPrice * count)}
              </span>
            </motion.button>
          )
        })}
      </div>

      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { y: -2 }}
        onClick={() =>
          onSelectCustom(customActive ? null : Math.max(unitPrice, 50))
        }
        className={cn(
          'flex w-full items-center justify-between rounded-[20px] border px-4 py-3.5 text-left transition',
          customActive
            ? 'border-amber-400/45 bg-amber-500/12'
            : 'border-white/10 bg-white/[0.04] hover:border-white/18'
        )}
      >
        <span>
          <span className="block text-[13px] font-semibold text-white">
            Custom amount
          </span>
          <span className="block text-[11px] text-white/40">
            Choose any tip you like
          </span>
        </span>
        <span className="text-[12px] font-medium text-amber-200/80">
          {customActive ? 'Selected' : 'Select'}
        </span>
      </motion.button>

      {customActive ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <label className="relative block">
            <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[14px] font-semibold text-white/40">
              ₹
            </span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={customAmount ?? ''}
              onChange={(e) => {
                const next = Number(e.target.value)
                onSelectCustom(Number.isFinite(next) && next > 0 ? next : 0)
              }}
              className="h-12 w-full rounded-2xl border border-amber-400/30 bg-amber-500/10 pr-3.5 pl-8 text-[16px] font-semibold text-white outline-none focus:border-amber-400/50"
              placeholder="Enter amount"
            />
          </label>
        </motion.div>
      ) : null}
    </div>
  )
}
