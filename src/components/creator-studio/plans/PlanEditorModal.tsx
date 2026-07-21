'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'

import type { CreatorPlan } from '@/data/creator-studio'
import { cn } from '@/lib/utils'

export interface PlanEditorModalProps {
  open: boolean
  plan?: CreatorPlan | null
  billing: 'monthly' | 'yearly'
  onBillingChange: (billing: 'monthly' | 'yearly') => void
  onClose: () => void
  onSave: (plan: CreatorPlan) => void
}

function emptyPlan(): CreatorPlan {
  return {
    id: `plan-${Date.now()}`,
    name: '',
    description: '',
    monthlyPrice: 299,
    yearlyPrice: 2999,
    benefits: ['Access to all subscriber-only posts'],
    enabled: true,
    accent: 'violet',
  }
}

export function PlanEditorModal({
  open,
  plan,
  billing,
  onBillingChange,
  onClose,
  onSave,
}: PlanEditorModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const [draft, setDraft] = useState<CreatorPlan>(emptyPlan)
  const [benefitInput, setBenefitInput] = useState('')

  useEffect(() => {
    if (!open) return
    setDraft(plan ? { ...plan, benefits: [...plan.benefits] } : emptyPlan())
    setBenefitInput('')
  }, [open, plan])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function addBenefit() {
    const next = benefitInput.trim()
    if (!next) return
    setDraft((d) => ({ ...d, benefits: [...d.benefits, next] }))
    setBenefitInput('')
  }

  const activePrice =
    billing === 'monthly' ? draft.monthlyPrice : draft.yearlyPrice
  const canSave = draft.name.trim().length > 0 && activePrice > 0

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/12 bg-[#0c0c12]/95 shadow-[0_40px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:rounded-[28px]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#0c0c12]/95 px-5 py-4 backdrop-blur-xl">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {plan ? 'Edit plan' : 'Create plan'}
                </h2>
                <p className="text-[12px] text-white/40">
                  A simple recurring plan for subscriber-only posts
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 p-2 text-white/70"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <label className="block space-y-2">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                  Plan name
                </span>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value.slice(0, 32) }))
                  }
                  placeholder="e.g. Monthly membership"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-[14px] text-white outline-none focus:border-fuchsia-400/35"
                />
              </label>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                  Billing cycle
                </span>
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
                  {(['monthly', 'yearly'] as const).map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => onBillingChange(cycle)}
                      className={cn(
                        'rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition',
                        billing === cycle
                          ? 'bg-white text-black'
                          : 'text-white/45 hover:text-white'
                      )}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                  {billing === 'monthly' ? 'Monthly' : 'Yearly'} price
                </span>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-white/40">
                    ₹
                  </span>
                  <input
                    inputMode="numeric"
                    value={activePrice || ''}
                    onChange={(e) => {
                      const value =
                        Number(e.target.value.replace(/[^0-9]/g, '')) || 0
                      setDraft((d) =>
                        billing === 'monthly'
                          ? { ...d, monthlyPrice: value }
                          : { ...d, yearlyPrice: value }
                      )
                    }}
                    placeholder="Enter price"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pr-3 pl-7 text-[16px] font-semibold text-white outline-none focus:border-fuchsia-400/35"
                  />
                </div>
                <p className="text-xs text-white/40">
                  Fans are charged ₹{activePrice || 0} every{' '}
                  {billing === 'monthly' ? 'month' : 'year'}.
                </p>
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                  Description <span className="normal-case">(optional)</span>
                </span>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      description: e.target.value.slice(0, 140),
                    }))
                  }
                  rows={2}
                  placeholder="What subscribers get"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[14px] text-white outline-none focus:border-fuchsia-400/35"
                />
              </label>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-white/35 uppercase">
                  Benefits <span className="normal-case">(optional)</span>
                </span>
                <div className="flex gap-2">
                  <input
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addBenefit()
                      }
                    }}
                    placeholder="Add a benefit"
                    className="h-11 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-[14px] text-white outline-none focus:border-fuchsia-400/35"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <ul className="space-y-2">
                  {draft.benefits.map((benefit, i) => (
                    <li
                      key={`${benefit}-${i}`}
                      className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[13px] text-white/75"
                    >
                      <span className="min-w-0 flex-1">{benefit}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            benefits: d.benefits.filter((_, idx) => idx !== i),
                          }))
                        }
                        className="text-white/35 hover:text-rose-300"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={!canSave}
                onClick={() => onSave(draft)}
                className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-[14px] font-semibold text-white disabled:opacity-40"
              >
                Save plan
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
