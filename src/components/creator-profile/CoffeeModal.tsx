'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Coffee, Heart, X } from 'lucide-react'

import type { PublicCreator } from '@/data/public-creator'
import { cn, formatCurrency } from '@/lib/utils'

const AMOUNTS = [1, 3, 5] as const

export interface CoffeeModalProps {
  open: boolean
  creator: PublicCreator
  onClose: () => void
  onSent?: (amount: number) => void
}

export function CoffeeModal({
  open,
  creator,
  onClose,
  onSent,
}: CoffeeModalProps) {
  const prefersReducedMotion = useReducedMotion()
  const [multiplier, setMultiplier] = useState<(typeof AMOUNTS)[number]>(1)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const unit = creator.coffeePrice
  const total = unit * multiplier

  useEffect(() => {
    if (!open) {
      setSent(false)
      setMessage('')
      setMultiplier(1)
      return
    }
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
  }, [open, onClose])

  function confirm() {
    setSent(true)
    onSent?.(total)
    window.setTimeout(() => onClose(), 1400)
  }

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
            aria-labelledby="coffee-modal-title"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }
            }
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative z-10 flex w-full max-w-[420px] flex-col overflow-hidden',
              'rounded-t-[28px] sm:rounded-[32px]',
              'border border-white/14 bg-[#120e0a]/90',
              'shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl'
            )}
          >
            <div className="relative h-36 shrink-0 overflow-hidden">
              <Image
                src={creator.coverImage}
                alt=""
                fill
                className="object-cover brightness-75"
                sizes="420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120e0a] via-[#120e0a]/70 to-amber-950/30" />
              <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur-md"
              >
                <X className="size-4" />
              </button>
              <div className="absolute inset-x-0 bottom-4 flex items-center gap-3 px-5">
                <span className="flex size-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/20 text-amber-100">
                  <Coffee className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2
                    id="coffee-modal-title"
                    className="text-[1.2rem] font-extrabold tracking-tight text-white"
                  >
                    Buy Me a Coffee
                  </h2>
                  <p className="text-[12px] text-white/50">Support @{creator.handle}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-8 text-center"
                  >
                    <span className="flex size-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-200">
                      <Check className="size-6" strokeWidth={2.5} />
                    </span>
                    <p className="text-lg font-bold text-white">Coffee sent!</p>
                    <p className="text-[14px] text-white/50">
                      {formatCurrency(total)} · {creator.name} says thank you
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <p className="text-[14px] leading-relaxed text-white/55">
                      Fuel {creator.name.split(' ')[0]}’s next drop with a coffee.
                      100% goes to the creator.
                    </p>

                    <div className="grid grid-cols-3 gap-2.5">
                      {AMOUNTS.map((n) => {
                        const active = multiplier === n
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setMultiplier(n)}
                            className={cn(
                              'rounded-[18px] border px-3 py-3 text-center transition',
                              active
                                ? 'border-amber-400/40 bg-amber-500/15 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                                : 'border-white/10 bg-white/[0.04] hover:border-white/18'
                            )}
                          >
                            <span className="flex items-center justify-center gap-1 text-amber-100">
                              {Array.from({ length: n }).map((_, i) => (
                                <Coffee key={i} className="size-3.5" aria-hidden />
                              ))}
                            </span>
                            <span className="mt-1.5 block text-[14px] font-bold text-white">
                              {formatCurrency(unit * n)}
                            </span>
                            <span className="text-[10px] text-white/40">
                              {n} coffee{n > 1 ? 's' : ''}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <label className="block space-y-2">
                      <span className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
                        Message
                      </span>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 120))}
                        placeholder="Say something nice…"
                        rows={2}
                        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-amber-400/35"
                      />
                    </label>

                    <motion.button
                      type="button"
                      onClick={confirm}
                      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-400 text-[15px] font-semibold text-white shadow-[0_14px_40px_rgba(245,158,11,0.35)]"
                    >
                      <Heart className="size-4 fill-white" aria-hidden />
                      Send {formatCurrency(total)}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
