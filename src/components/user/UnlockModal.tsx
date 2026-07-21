'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Check, Lock, Sparkles, X, Zap } from 'lucide-react'

import type { FeedCreator } from '@/data/user-feed'
import { ApiError } from '@/lib/api'
import {
  fetchCreatorPlanId,
  isUuid,
  payForExclusivePost,
  payForSubscription,
} from '@/lib/razorpay-checkout'
import { useAuthStore } from '@/stores/auth'
import { cn, formatCurrency } from '@/lib/utils'

/** Demo defaults matching product copy. */
export const LOCKED_POST_PRICE = 49
export const MONTHLY_SUB_PRICE = 299

export interface UnlockTarget {
  postId: string
  title: string
  price?: number
  thumbnailUrl: string
  blurredThumbnailUrl?: string
  creator: FeedCreator
  planId?: string | null
  /** PPV exclusives vs member-only locks */
  lockKind?: 'ppv' | 'subscribers' | null
  /** When true, hide monthly option — member already pays for membership posts */
  alreadySubscribed?: boolean
}

export interface UnlockModalProps {
  open: boolean
  target: UnlockTarget | null
  onClose: () => void
  onBuyPost?: (postId: string) => void
  onSubscribe?: (creatorId: string) => void
  postPrice?: number
  subscriptionPrice?: number
}

const SUB_BENEFITS = [
  'Unlock member posts for a month',
  'Member-only drops & early access',
  'Support the creator directly',
  'Cancel anytime',
]

const POST_BENEFITS = [
  'One-time purchase',
  'Keep access forever',
  'HD quality unlock',
]

type PlanChoice = 'post' | 'subscription'

export function UnlockModal({
  open,
  target,
  onClose,
  onBuyPost,
  onSubscribe,
  postPrice = LOCKED_POST_PRICE,
  subscriptionPrice = MONTHLY_SUB_PRICE,
}: UnlockModalProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const prefersReducedMotion = useReducedMotion()
  const [choice, setChoice] = useState<PlanChoice>('subscription')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unitPrice = target?.price && target.price > 0 ? target.price : postPrice
  const subPrice = target?.creator.monthlyPrice || subscriptionPrice
  const alreadySubscribed = Boolean(target?.alreadySubscribed)
  // Not subscribed → monthly + “see only this post”.
  // Already subscribed → pay-per-post only.
  const showPostOption = Boolean(target?.postId)
  const showSubOption = Boolean(target) && !alreadySubscribed
  const postOnly = alreadySubscribed && showPostOption

  useEffect(() => {
    if (!open) return
    setChoice(
      postOnly || (showPostOption && !showSubOption)
        ? 'post'
        : showSubOption
          ? 'subscription'
          : 'post'
    )
    setError(null)
    setPaying(false)
  }, [open, target?.postId, postOnly, showPostOption, showSubOption])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !paying) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, paying])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function confirm() {
    if (!target || paying) return
    if (!user) {
      const from = encodeURIComponent(
        typeof window !== 'undefined' ? window.location.pathname : '/'
      )
      router.push(`/login?from=${from}`)
      return
    }

    setPaying(true)
    setError(null)
    try {
      if (choice === 'post') {
        if (isUuid(target.postId)) {
          await payForExclusivePost(target.postId)
        }
        onBuyPost?.(target.postId)
      } else {
        let planId = target.planId ?? null
        if (!planId) {
          planId = await fetchCreatorPlanId(target.creator.handle)
        }
        if (planId) {
          await payForSubscription(planId)
        }
        onSubscribe?.(target.creator.id)
      }
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const from = encodeURIComponent(
          typeof window !== 'undefined' ? window.location.pathname : '/'
        )
        router.push(`/login?from=${from}`)
        return
      }
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <AnimatePresence>
      {open && target ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="locked-post-title"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 40, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 24, scale: 0.98 }
            }
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative z-10 flex max-h-[92dvh] w-full max-w-[440px] flex-col overflow-hidden',
              'rounded-t-[28px] sm:rounded-[32px]',
              'border border-white/14 bg-[#0c0c12]/70',
              'shadow-[0_40px_120px_rgba(0,0,0,0.7),0_0_60px_rgba(168,85,247,0.12)]',
              'backdrop-blur-2xl backdrop-saturate-150'
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.1] via-transparent to-fuchsia-500/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl"
            />

            <div className="relative h-44 shrink-0 overflow-hidden sm:h-48">
              <Image
                src={target.blurredThumbnailUrl || target.thumbnailUrl}
                alt=""
                fill
                className="scale-110 object-cover blur-2xl brightness-75"
                sizes="440px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/50 to-black/25" />

              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute top-3 right-3 z-20 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur-md transition hover:bg-black/55 hover:text-white"
              >
                <X className="size-4" />
              </button>

              <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 px-5 pb-4">
                <Image
                  src={target.creator.avatar}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-2xl object-cover ring-2 ring-white/25"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-[15px] font-semibold text-white">
                    {target.creator.name}
                    {target.creator.verified ? (
                      <BadgeCheck
                        className="size-4 fill-sky-500 text-white"
                        aria-hidden
                      />
                    ) : null}
                  </p>
                  <p className="text-[12px] text-white/50">@{target.creator.handle}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/15 px-2.5 py-1 text-[11px] font-medium text-amber-100 backdrop-blur-md">
                  <Lock className="size-3" aria-hidden />
                  Locked
                </span>
              </div>
            </div>

            <div className="relative space-y-5 overflow-y-auto px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <h2
                  id="locked-post-title"
                  className="text-[1.35rem] font-extrabold tracking-tight text-white sm:text-2xl"
                >
                  {showPostOption && showSubOption
                    ? 'Unlock options'
                    : showPostOption
                      ? 'Unlock this post'
                      : 'Join the membership'}
                </h2>
                <p className="mt-1.5 text-[14px] text-white/55">{target.title}</p>
              </motion.div>

              <div className="space-y-3">
                {showPostOption ? (
                  <PlanOption
                    selected={choice === 'post'}
                    onSelect={() => setChoice('post')}
                    icon={<Zap className="size-5" aria-hidden />}
                    iconClassName="bg-white text-black"
                    title="See only this post"
                    subtitle="One-time unlock · no monthly plan"
                    priceLabel={formatCurrency(unitPrice)}
                    priceHint="one-time"
                    prefersReducedMotion={!!prefersReducedMotion}
                    delay={0.12}
                  />
                ) : null}

                {showPostOption && showSubOption ? (
                  <div className="flex items-center gap-3 py-0.5">
                    <span className="h-px flex-1 bg-white/10" aria-hidden />
                    <span className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
                      OR
                    </span>
                    <span className="h-px flex-1 bg-white/10" aria-hidden />
                  </div>
                ) : null}

                {showSubOption ? (
                  <PlanOption
                    selected={choice === 'subscription'}
                    onSelect={() => setChoice('subscription')}
                    icon={<Sparkles className="size-5" aria-hidden />}
                    iconClassName="bg-gradient-to-br from-violet-500 to-pink-500 text-white"
                    title="Monthly Subscription"
                    subtitle={`Member posts from ${target.creator.name.split(' ')[0]}`}
                    priceLabel={formatCurrency(subPrice)}
                    priceHint="/month"
                    featured
                    prefersReducedMotion={!!prefersReducedMotion}
                    delay={0.18}
                  />
                ) : null}
              </div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
              >
                <p className="text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                  {choice === 'subscription' ? 'Creator benefits' : 'What you get'}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {(choice === 'subscription' ? SUB_BENEFITS : POST_BENEFITS).map(
                    (benefit, index) => (
                      <motion.li
                        key={benefit}
                        initial={
                          prefersReducedMotion ? false : { opacity: 0, x: -6 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.24 + index * 0.04 }}
                        className="flex items-start gap-2.5 text-[13px] text-white/70"
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                            choice === 'subscription'
                              ? 'border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200'
                              : 'border-white/20 bg-white/10 text-white'
                          )}
                        >
                          <Check className="size-3" strokeWidth={3} aria-hidden />
                        </span>
                        {benefit}
                      </motion.li>
                    )
                  )}
                </ul>
              </motion.div>

              {error ? (
                <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                  {error}
                </p>
              ) : null}

              <motion.button
                type="button"
                disabled={paying}
                onClick={confirm}
                whileHover={prefersReducedMotion || paying ? undefined : { y: -2 }}
                whileTap={prefersReducedMotion || paying ? undefined : { scale: 0.985 }}
                className={cn(
                  'flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold text-white disabled:opacity-60',
                  choice === 'subscription'
                    ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_14px_40px_rgba(217,70,239,0.4)]'
                    : 'bg-white text-black shadow-[0_14px_40px_rgba(255,255,255,0.12)] hover:bg-neutral-100'
                )}
              >
                {paying
                  ? 'Opening Razorpay…'
                  : choice === 'subscription'
                    ? `Subscribe · ${formatCurrency(subPrice)}/mo`
                    : `See only this post · ${formatCurrency(unitPrice)}`}
              </motion.button>

              <p className="text-center text-[11px] text-white/30">
                Secure checkout via Razorpay
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

interface PlanOptionProps {
  selected: boolean
  onSelect: () => void
  icon: React.ReactNode
  iconClassName?: string
  title: string
  subtitle: string
  priceLabel: string
  priceHint: string
  featured?: boolean
  prefersReducedMotion: boolean
  delay?: number
}

function PlanOption({
  selected,
  onSelect,
  icon,
  iconClassName,
  title,
  subtitle,
  priceLabel,
  priceHint,
  featured,
  prefersReducedMotion,
  delay = 0,
}: PlanOptionProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-[22px] border p-4 text-left transition-colors',
        selected
          ? featured
            ? 'border-fuchsia-400/40 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-pink-500/15 shadow-[0_0_32px_rgba(217,70,239,0.2)]'
            : 'border-white/30 bg-white/[0.1] shadow-[0_0_28px_rgba(255,255,255,0.08)]'
          : 'border-white/10 bg-white/[0.04] hover:border-white/18 hover:bg-white/[0.07]'
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-2xl',
          iconClassName
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-white">{title}</span>
        <span className="mt-0.5 block text-[12px] text-white/45">{subtitle}</span>
      </span>
      <span className="text-right">
        <span className="block text-[16px] font-bold tracking-tight text-white">
          {priceLabel}
        </span>
        <span className="block text-[10px] font-medium text-white/40 uppercase">
          {priceHint}
        </span>
      </span>
      {selected ? (
        <span className="absolute top-3 right-3 size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      ) : null}
    </motion.button>
  )
}
