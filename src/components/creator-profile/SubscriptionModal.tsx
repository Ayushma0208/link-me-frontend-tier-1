'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Check, Lock, Sparkles, X, Zap } from 'lucide-react'

import type { PublicCreator, PublicPost } from '@/data/public-creator'
import { ApiError } from '@/lib/api'
import {
  fetchCreatorPlanId,
  payForExclusivePost,
  payForSubscription,
} from '@/lib/razorpay-checkout'
import { useAuthStore } from '@/stores/auth'
import { cn, formatCurrency } from '@/lib/utils'

export interface SubscriptionModalTarget {
  post?: PublicPost | null
  mode?: 'post' | 'subscribe'
}

export interface SubscriptionModalProps {
  open: boolean
  creator: PublicCreator
  target?: SubscriptionModalTarget | null
  /** Fan already has an active monthly membership */
  alreadySubscribed?: boolean
  onClose: () => void
  onBuyPost?: (postId: string) => void
  onSubscribe?: () => void
}

const SUB_BENEFITS = [
  'Unlock member posts for a month',
  'Member-only drops & early access',
  'Directly support the creator',
  'Cancel anytime',
]

const POST_BENEFITS = ['One-time purchase', 'Keep access forever', 'HD quality unlock']

type Choice = 'post' | 'subscription'

export function SubscriptionModal({
  open,
  creator,
  target,
  alreadySubscribed = false,
  onClose,
  onBuyPost,
  onSubscribe,
}: SubscriptionModalProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const prefersReducedMotion = useReducedMotion()
  const [choice, setChoice] = useState<Choice>('subscription')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const post = target?.post
  const postPrice =
    (post?.price && post.price > 0 ? post.price : null) ||
    creator.postPrice ||
    99
  // Not subscribed → always offer one-time post unlock when a post is in context.
  const showPostOption = Boolean(post)
  const showSubOption = !alreadySubscribed

  useEffect(() => {
    if (!open) return
    setChoice(
      showPostOption && !showSubOption
        ? 'post'
        : showSubOption
          ? 'subscription'
          : 'post'
    )
    setError(null)
    setPaying(false)
  }, [open, target?.mode, showPostOption, showSubOption])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !paying) onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, paying])

  async function confirm() {
    if (paying) return
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
      if (choice === 'post' && post) {
        await payForExclusivePost(post.id)
        onBuyPost?.(post.id)
      } else {
        let planId = creator.planId ?? null
        if (!planId) {
          planId = await fetchCreatorPlanId(creator.handle)
        }
        if (!planId) {
          throw new Error('This creator has no monthly plan yet')
        }
        await payForSubscription(planId)
        onSubscribe?.()
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

  const preview = post?.thumbnailUrl || creator.coverImage

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
            onClick={() => {
              if (!paying) onClose()
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sub-modal-title"
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }
            }
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative z-10 flex max-h-[92dvh] w-full max-w-[440px] flex-col overflow-hidden',
              'rounded-t-[28px] sm:rounded-[32px]',
              'border border-white/14 bg-[#0c0c12]/75',
              'shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl'
            )}
          >
            <div className="relative h-44 shrink-0 overflow-hidden sm:h-48">
              <Image
                src={preview}
                alt=""
                fill
                className="scale-110 object-cover blur-2xl brightness-75"
                sizes="440px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/55 to-black/20" />
              <button
                type="button"
                aria-label="Close modal"
                disabled={paying}
                onClick={onClose}
                className="absolute top-3 right-3 rounded-full border border-white/15 bg-black/40 p-2 text-white/80 backdrop-blur-md disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
              <div className="absolute inset-x-0 bottom-4 flex items-center gap-3 px-5">
                <Image
                  src={creator.avatar}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-2xl object-cover ring-2 ring-white/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-[15px] font-semibold text-white">
                    {creator.name}
                    {creator.verified ? (
                      <BadgeCheck className="size-4 fill-sky-500 text-white" aria-hidden />
                    ) : null}
                  </p>
                  <p className="text-[12px] text-white/50">@{creator.handle}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/15 px-2.5 py-1 text-[11px] text-amber-100">
                  <Lock className="size-3" aria-hidden />
                  Locked
                </span>
              </div>
            </div>

            <div className="space-y-5 overflow-y-auto px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
              <div>
                <h2
                  id="sub-modal-title"
                  className="text-[1.35rem] font-extrabold tracking-tight text-white"
                >
                  {showPostOption && showSubOption
                    ? 'Unlock options'
                    : showPostOption
                      ? 'Unlock this post'
                      : 'Join the membership'}
                </h2>
                <p className="mt-1.5 text-[14px] text-white/55">
                  {post?.title || `Full access to ${creator.name}`}
                </p>
              </div>

              {showPostOption && post ? (
                <OptionCard
                  selected={choice === 'post'}
                  onSelect={() => setChoice('post')}
                  icon={<Zap className="size-5" />}
                  iconClass="bg-white text-black"
                  title="See only this post"
                  subtitle="One-time unlock · no monthly plan"
                  price={formatCurrency(postPrice)}
                  hint="one-time"
                />
              ) : null}

              {showPostOption && showSubOption ? (
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
                    OR
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
              ) : null}

              {showSubOption ? (
                <OptionCard
                  selected={choice === 'subscription'}
                  onSelect={() => setChoice('subscription')}
                  icon={<Sparkles className="size-5" />}
                  iconClass="bg-gradient-to-br from-[#ff4d9a] to-[#ffb03a] text-white"
                  title="Monthly subscription"
                  subtitle={`Member posts from ${creator.name.split(' ')[0]}`}
                  price={formatCurrency(creator.monthlyPrice)}
                  hint="/month"
                  featured
                />
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                  {choice === 'subscription' ? 'Creator benefits' : 'What you get'}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {(choice === 'subscription' ? SUB_BENEFITS : POST_BENEFITS).map(
                    (benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 text-[13px] text-white/70"
                      >
                        <span className="mt-0.5 flex size-5 items-center justify-center rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200">
                          <Check className="size-3" strokeWidth={3} aria-hidden />
                        </span>
                        {benefit}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {error ? (
                <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                  {error}
                </p>
              ) : null}

              <motion.button
                type="button"
                disabled={paying}
                onClick={confirm}
                whileHover={
                  prefersReducedMotion || paying ? undefined : { y: -2 }
                }
                className={cn(
                  'flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold disabled:opacity-60',
                  choice === 'subscription'
                    ? 'bg-gradient-to-r from-[#ff4d9a] via-[#ff6a4d] to-[#ffb03a] text-white shadow-[0_14px_40px_rgba(255,77,154,0.4)]'
                    : 'bg-white text-black'
                )}
              >
                {paying
                  ? 'Opening Razorpay…'
                  : choice === 'subscription'
                    ? `Subscribe · ${formatCurrency(creator.monthlyPrice)}/mo`
                    : `See only this post · ${formatCurrency(postPrice)}`}
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

function OptionCard({
  selected,
  onSelect,
  icon,
  iconClass,
  title,
  subtitle,
  price,
  hint,
  featured,
}: {
  selected: boolean
  onSelect: () => void
  icon: React.ReactNode
  iconClass: string
  title: string
  subtitle: string
  price: string
  hint: string
  featured?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-[22px] border p-4 text-left transition-colors',
        selected
          ? featured
            ? 'border-[#ff4d9a]/40 bg-gradient-to-br from-[#ff4d9a]/15 to-[#ffb03a]/10'
            : 'border-white/30 bg-white/[0.1]'
          : 'border-white/10 bg-white/[0.04] hover:border-white/18'
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-2xl',
          iconClass
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-white">{title}</span>
        <span className="mt-0.5 block text-[12px] text-white/45">{subtitle}</span>
      </span>
      <span className="text-right">
        <span className="block text-[16px] font-bold text-white">{price}</span>
        <span className="block text-[10px] text-white/40 uppercase">{hint}</span>
      </span>
    </button>
  )
}
