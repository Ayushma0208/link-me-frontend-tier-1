'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Coffee,
  Heart,
  Lock,
  Sparkles,
} from 'lucide-react'

import { CoffeeAmountPicker } from '@/components/coffee/CoffeeAmountPicker'
import { CoffeePaymentSummary } from '@/components/coffee/CoffeePaymentSummary'
import { CoffeeSupporters } from '@/components/coffee/CoffeeSupporters'
import { Logo } from '@/components/layout/Logo'
import { coffeeSupporters, defaultCoffeeConfig } from '@/data/creator-studio'
import type { PublicCreator } from '@/data/public-creator'
import { ApiError } from '@/lib/api'
import { payForCoffee } from '@/lib/razorpay-checkout'
import { useAuthStore } from '@/stores/auth'
import { cn, formatCurrency } from '@/lib/utils'

export interface BuyMeCoffeePageProps {
  creator: PublicCreator
}

export function BuyMeCoffeePage({ creator }: BuyMeCoffeePageProps) {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const unit = creator.coffeePrice
  const [coffeeCount, setCoffeeCount] = useState(1)
  const [customAmount, setCustomAmount] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [name, setName] = useState('')
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = customAmount ?? unit * coffeeCount
  const mode: 'preset' | 'custom' = customAmount != null ? 'custom' : 'preset'
  const coffeeLabel =
    mode === 'custom'
      ? 'Custom tip'
      : `${coffeeCount} coffee${coffeeCount === 1 ? '' : 's'}`

  const supporters = useMemo(() => coffeeSupporters.slice(0, 6), [])

  function selectPreset(count: number) {
    setCoffeeCount(count)
    setCustomAmount(null)
  }

  function selectCustom(amount: number | null) {
    setCustomAmount(amount)
  }

  async function handlePay() {
    if (total <= 0 || paying) return
    if (!user) {
      window.location.href = `/login?from=${encodeURIComponent(`/${creator.handle}/coffee`)}`
      return
    }
    setPaying(true)
    setError(null)
    try {
      await payForCoffee({
        creatorUsername: creator.handle,
        amount: total,
        message: message.trim() || undefined,
        isAnonymous: anonymous,
        donorDisplayName: anonymous ? undefined : name.trim() || user.name,
      })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = `/login?from=${encodeURIComponent(`/${creator.handle}/coffee`)}`
        return
      }
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#0a0806] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src={creator.coverImage}
          alt=""
          fill
          priority
          className="object-cover opacity-40 blur-2xl scale-110"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806]/40 via-[#0a0806]/85 to-[#0a0806]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.22),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,77,154,0.12),_transparent_50%)]" />
      </div>

      <header className="relative z-20 border-b border-white/8 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href={`/${creator.handle}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to profile
          </Link>
          <Link href="/">
            <Logo markSize="sm" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:py-12">
        <motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <div className="overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.05] shadow-[0_40px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="relative h-36 sm:h-44">
              <Image
                src={creator.coverImage}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 560px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120e0a] via-[#120e0a]/40 to-transparent" />
            </div>

            <div className="relative -mt-12 space-y-4 px-5 pb-6 sm:px-7 sm:pb-7">
              <div className="flex items-end gap-4">
                <motion.div
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                  className="relative size-24 shrink-0 overflow-hidden rounded-[26px] ring-[3px] ring-[#120e0a] shadow-[0_16px_40px_rgba(0,0,0,0.45)] sm:size-28"
                >
                  <Image
                    src={creator.avatar}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                    priority
                  />
                </motion.div>
                <div className="min-w-0 pb-1">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-amber-200/70 uppercase">
                    Buy Me a Coffee
                  </p>
                  <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {creator.name}
                    {creator.verified ? (
                      <BadgeCheck
                        className="size-6 fill-sky-500 text-white"
                        aria-label="Verified"
                      />
                    ) : null}
                  </h1>
                  <p className="text-[14px] text-white/45">@{creator.handle}</p>
                </div>
              </div>

              <p className="max-w-xl text-[15px] leading-relaxed text-white/60">
                Support {creator.name.split(' ')[0]} with a coffee. Tips go
                straight to the creator — no membership required.
              </p>

              <div className="rounded-[22px] border border-amber-400/20 bg-amber-500/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/20 text-amber-100">
                    <Heart className="size-4 fill-amber-100" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-amber-100/90">
                      {defaultCoffeeConfig.goalTitle}
                    </p>
                    <p className="mt-0.5 text-[12px] text-amber-100/50">
                      Every coffee helps {creator.name.split(' ')[0]} keep creating
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CoffeeSupporters supporters={supporters} hideAmounts />
        </motion.section>

        <motion.aside
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="lg:sticky lg:top-20 lg:self-start"
        >
          <div className="overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="border-b border-white/8 bg-gradient-to-br from-amber-500/15 via-transparent to-pink-500/10 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/20 text-amber-100">
                  <Coffee className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Send a coffee
                  </h2>
                  <p className="text-[12px] text-white/45">
                    {formatCurrency(unit)} each · Razorpay checkout
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-10 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                      className="flex size-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                    >
                      <Check className="size-7" strokeWidth={2.5} />
                    </motion.span>
                    <div>
                      <p className="text-xl font-extrabold">Coffee sent!</p>
                      <p className="mt-1.5 text-[14px] text-white/50">
                        {formatCurrency(total)} ·{' '}
                        {anonymous ? 'Anonymous' : name.trim() || 'You'} →{' '}
                        {creator.name}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Link
                        href={`/${creator.handle}`}
                        className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-black"
                      >
                        Back to profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSuccess(false)
                          setMessage('')
                          setCustomAmount(null)
                          setCoffeeCount(1)
                        }}
                        className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.05] px-5 text-[13px] font-semibold text-white"
                      >
                        Send another
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <CoffeeAmountPicker
                      unitPrice={unit}
                      coffeeCount={coffeeCount}
                      customAmount={customAmount}
                      onSelectPreset={selectPreset}
                      onSelectCustom={selectCustom}
                    />

                    <label className="block space-y-2">
                      <span className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
                        Leave a message
                      </span>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 160))}
                        placeholder="Say something nice…"
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-amber-400/35"
                      />
                      <span className="block text-right text-[11px] text-white/30">
                        {message.length}/160
                      </span>
                    </label>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setAnonymous((v) => !v)}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left transition hover:border-white/16"
                      >
                        <span className="flex items-center gap-2.5">
                          <Lock className="size-4 text-white/45" aria-hidden />
                          <span>
                            <span className="block text-[13px] font-medium text-white/80">
                              Send anonymously
                            </span>
                            <span className="block text-[11px] text-white/40">
                              Hide your name from the creator wall
                            </span>
                          </span>
                        </span>
                        <span
                          className={cn(
                            'relative h-6 w-11 rounded-full transition-colors',
                            anonymous ? 'bg-amber-500' : 'bg-white/15'
                          )}
                        >
                          <motion.span
                            layout
                            className={cn(
                              'absolute top-0.5 size-5 rounded-full bg-white shadow',
                              anonymous ? 'left-[22px]' : 'left-0.5'
                            )}
                          />
                        </span>
                      </button>

                      {!anonymous ? (
                        <motion.label
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="block space-y-2 overflow-hidden"
                        >
                          <span className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase">
                            Your name
                          </span>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 40))}
                            placeholder="How should we show you?"
                            className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-amber-400/35"
                          />
                        </motion.label>
                      ) : null}
                    </div>

                    <CoffeePaymentSummary
                      unitPrice={unit}
                      coffeeCount={coffeeCount}
                      customAmount={customAmount}
                      total={total}
                      label={coffeeLabel}
                      anonymous={anonymous}
                      supporterName={name}
                      message={message}
                    />

                    {error ? (
                      <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                        {error}
                      </p>
                    ) : null}

                    <motion.button
                      type="button"
                      disabled={total <= 0 || paying}
                      onClick={handlePay}
                      whileHover={
                        prefersReducedMotion || paying
                          ? undefined
                          : { y: -2 }
                      }
                      whileTap={
                        prefersReducedMotion || paying
                          ? undefined
                          : { scale: 0.98 }
                      }
                      className={cn(
                        'flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition',
                        'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-400 text-white',
                        'shadow-[0_16px_44px_rgba(245,158,11,0.35)]',
                        'disabled:cursor-not-allowed disabled:opacity-50'
                      )}
                    >
                      {paying ? (
                        <>
                          <Sparkles className="size-4 animate-pulse" aria-hidden />
                          Opening Razorpay…
                        </>
                      ) : (
                        <>
                          <Heart className="size-4 fill-white" aria-hidden />
                          Support {formatCurrency(total)}
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-[11px] text-white/30">
                      Secure checkout via Razorpay
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.aside>
      </main>
    </div>
  )
}
