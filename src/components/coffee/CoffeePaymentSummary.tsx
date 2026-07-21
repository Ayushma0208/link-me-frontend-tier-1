'use client'

import { motion } from 'framer-motion'

import { cn, formatCurrency } from '@/lib/utils'

export interface CoffeePaymentSummaryProps {
  unitPrice: number
  coffeeCount: number
  customAmount: number | null
  total: number
  label: string
  anonymous: boolean
  supporterName: string
  message: string
  className?: string
}

export function CoffeePaymentSummary({
  unitPrice,
  coffeeCount,
  customAmount,
  total,
  label,
  anonymous,
  supporterName,
  message,
  className,
}: CoffeePaymentSummaryProps) {
  const from = anonymous
    ? 'Anonymous'
    : supporterName.trim() || 'You'

  return (
    <motion.div
      layout
      className={cn(
        'space-y-3 rounded-[22px] border border-white/10 bg-black/25 p-4 backdrop-blur-md',
        className
      )}
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
        Payment summary
      </p>

      <div className="space-y-2 text-[13px]">
        <div className="flex items-center justify-between gap-3 text-white/55">
          <span>{label}</span>
          <span className="tabular-nums text-white/80">
            {customAmount != null
              ? formatCurrency(customAmount)
              : `${coffeeCount} × ${formatCurrency(unitPrice)}`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-white/55">
          <span>From</span>
          <span className="truncate text-white/80">{from}</span>
        </div>
        {message.trim() ? (
          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[12px] leading-relaxed text-white/50">
            “{message.trim()}”
          </div>
        ) : null}
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-white">Total</span>
          <motion.span
            key={total}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-extrabold tracking-tight text-amber-100"
          >
            {formatCurrency(Math.max(total, 0))}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
