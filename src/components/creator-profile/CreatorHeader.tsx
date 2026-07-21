'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Coffee,
  FileImage,
  MessageCircle,
  Pencil,
  Phone,
  Share2,
  Video,
} from 'lucide-react'

import type { PublicCreator } from '@/data/public-creator'
import { SocialLinks } from '@/components/creator-profile/SocialLinks'
import {
  buttonRadiusClass,
  defaultAppearance,
  withAlpha,
  type ProfileAppearance,
} from '@/lib/profile-appearance'
import { cn, formatCurrency } from '@/lib/utils'

export type ProfileViewerMode = 'guest' | 'fan' | 'subscriber' | 'owner'

export interface CreatorHeaderProps {
  creator: PublicCreator
  mode: ProfileViewerMode
  following: boolean
  subscribed: boolean
  appearance?: ProfileAppearance
  /** Active 24h stories — ring on avatar like Instagram */
  hasLiveStories?: boolean
  storiesSeen?: boolean
  onOpenStories?: () => void
  onFollow: () => void
  onSubscribe: () => void
  onShare: () => void
  onCoffee?: () => void
  onCollab?: () => void
  onMessage?: () => void
  onVoiceCall?: () => void
  onVideoCall?: () => void
  className?: string
}

export function CreatorHeader({
  creator,
  mode,
  following: _following,
  subscribed,
  appearance = defaultAppearance,
  hasLiveStories = false,
  storiesSeen = false,
  onOpenStories,
  onFollow: _onFollow,
  onSubscribe,
  onShare,
  onCoffee,
  onCollab,
  onMessage,
  onVoiceCall,
  onVideoCall,
  className,
}: CreatorHeaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const isLight = appearance.theme === 'light'
  const radius = buttonRadiusClass(appearance.buttonStyle)
  void _following
  void _onFollow

  return (
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn('relative', className)}
    >
      {/* Soft top wash — Instagram profiles don’t use a big cover */}
      <div
        className={cn(
          'h-16 sm:h-20',
          isLight ? 'bg-[#fafafa]' : 'bg-black'
        )}
        style={{
          backgroundImage: isLight
            ? undefined
            : `radial-gradient(ellipse 80% 120% at 50% -20%, ${withAlpha(appearance.accent, 0.22)}, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-[935px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-6 sm:gap-10 md:gap-16">
          {/* Avatar + optional live story ring — self-start so flex
              row height never stretches this into a capsule/pill. */}
          {hasLiveStories && onOpenStories ? (
            <motion.button
              type="button"
              onClick={onOpenStories}
              aria-label={`View ${creator.name}'s story`}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className={cn(
                'relative size-[86px] shrink-0 self-start overflow-hidden rounded-full p-[3px] sm:size-[150px]',
                storiesSeen
                  ? isLight
                    ? 'bg-zinc-300'
                    : 'bg-[#363636]'
                  : 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'
              )}
            >
              <span
                className={cn(
                  'relative block size-full overflow-hidden rounded-full p-[3px]',
                  isLight ? 'bg-white' : 'bg-black'
                )}
              >
                <span
                  className={cn(
                    'relative block size-full overflow-hidden rounded-full',
                    isLight ? 'bg-zinc-100' : 'bg-black'
                  )}
                >
                  <Image
                    src={creator.avatar}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="150px"
                    priority
                    unoptimized={
                      creator.avatar.includes('dicebear.com') ||
                      creator.avatar.endsWith('.svg')
                    }
                  />
                </span>
              </span>
            </motion.button>
          ) : (
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              className={cn(
                'relative size-[86px] shrink-0 self-start overflow-hidden rounded-full p-[3px] sm:size-[150px]',
                isLight ? 'bg-zinc-200' : 'bg-white/15'
              )}
            >
              <span
                className={cn(
                  'relative block size-full overflow-hidden rounded-full p-[3px]',
                  isLight ? 'bg-white' : 'bg-black'
                )}
              >
                <span
                  className={cn(
                    'relative block size-full overflow-hidden rounded-full',
                    isLight ? 'bg-zinc-100' : 'bg-black'
                  )}
                >
                  <Image
                    src={creator.avatar}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="150px"
                    priority
                    unoptimized={
                      creator.avatar.includes('dicebear.com') ||
                      creator.avatar.endsWith('.svg')
                    }
                  />
                </span>
              </span>
            </motion.div>
          )}

          <div className="min-w-0 flex-1 space-y-4 pt-1 sm:space-y-5 sm:pt-2">
            {/* Username row + Subscribe */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <h1
                  className={cn(
                    'truncate text-[22px] font-light tracking-tight sm:text-[28px]',
                    isLight ? 'text-zinc-900' : 'text-white'
                  )}
                >
                  {creator.handle}
                </h1>
                {creator.verified ? (
                  <BadgeCheck
                    className="size-5 shrink-0 fill-sky-500 text-white sm:size-6"
                    aria-label="Verified"
                  />
                ) : null}
                {mode === 'owner' ? (
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/70 uppercase">
                    Your page
                  </span>
                ) : null}
                {mode === 'subscriber' ? (
                  <span className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-200 uppercase">
                    Member
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {mode === 'owner' ? (
                  <OwnerActions
                    onShare={onShare}
                    prefersReducedMotion={!!prefersReducedMotion}
                    appearance={appearance}
                    radius={radius}
                    isLight={isLight}
                  />
                ) : (
                  <ViewerActions
                    mode={mode}
                    creator={creator}
                    subscribed={subscribed}
                    onSubscribe={onSubscribe}
                    onShare={onShare}
                    onCoffee={onCoffee}
                    onCollab={onCollab}
                    onMessage={onMessage}
                    onVoiceCall={onVoiceCall}
                    onVideoCall={onVideoCall}
                    prefersReducedMotion={!!prefersReducedMotion}
                    appearance={appearance}
                    radius={radius}
                    isLight={isLight}
                  />
                )}
              </div>
            </div>

            {/* Posts only — no followers / following */}
            <p
              className={cn(
                'text-[14px] sm:text-[16px]',
                isLight ? 'text-zinc-900' : 'text-white'
              )}
            >
              <span className="font-semibold">
                {(
                  creator.stats.posts ?? creator.posts.length
                ).toLocaleString()}
              </span>{' '}
              <span className={isLight ? 'text-zinc-500' : 'text-white/55'}>
                posts
              </span>
            </p>

            {/* Name + bio */}
            <div className="max-w-md space-y-1">
              <p
                className={cn(
                  'text-[14px] font-semibold',
                  isLight ? 'text-zinc-900' : 'text-white'
                )}
              >
                {creator.name}
              </p>
              <p
                className={cn(
                  'text-[14px] leading-snug whitespace-pre-line',
                  isLight ? 'text-zinc-700' : 'text-white/70'
                )}
              >
                {creator.bio}
              </p>
              {creator.category ? (
                <p
                  className={cn(
                    'pt-1 text-[13px]',
                    isLight ? 'text-zinc-400' : 'text-white/40'
                  )}
                >
                  {creator.category}
                  {creator.location ? ` · ${creator.location}` : ''}
                </p>
              ) : null}
            </div>

            <SocialLinks
              links={creator.socialLinks}
              handle={creator.handle}
              className="pt-1"
            />
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function primaryButtonStyle(appearance: ProfileAppearance, isLight: boolean) {
  if (appearance.buttonStyle === 'outline') {
    return {
      color: appearance.accent,
      boxShadow: `inset 0 0 0 1.5px ${appearance.accent}`,
      background: 'transparent',
    }
  }
  if (appearance.buttonStyle === 'soft') {
    return {
      background: withAlpha(appearance.accent, 0.22),
      color: isLight ? '#18181b' : '#fff',
    }
  }
  return {
    background: appearance.accent || '#0095f6',
    color: '#fff',
  }
}

function OwnerActions({
  onShare,
  prefersReducedMotion,
  appearance,
  radius,
  isLight,
}: {
  onShare: () => void
  prefersReducedMotion: boolean
  appearance: ProfileAppearance
  radius: string
  isLight: boolean
}) {
  const actions = [
    {
      label: 'Edit Profile',
      href: '/influencer/settings',
      icon: Pencil,
      primary: true as boolean,
    },
    {
      label: 'Analytics',
      href: '/influencer/analytics',
      icon: BarChart3,
      primary: false as boolean,
    },
    {
      label: 'Manage Posts',
      href: '/influencer/posts',
      icon: FileImage,
      primary: false as boolean,
    },
  ]

  return (
    <>
      {actions.map((action) => (
        <motion.div
          key={action.label}
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        >
          <Link
            href={action.href}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 px-4 text-[13px] font-semibold sm:h-9',
              radius,
              !action.primary &&
                (isLight
                  ? 'border border-black/10 bg-zinc-100 text-zinc-900'
                  : 'border border-white/12 bg-white/[0.08] text-white')
            )}
            style={action.primary ? primaryButtonStyle(appearance, isLight) : undefined}
          >
            <action.icon className="size-3.5" aria-hidden />
            {action.label}
          </Link>
        </motion.div>
      ))}
      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        onClick={onShare}
        aria-label="Share profile"
        className={cn(
          'inline-flex size-8 items-center justify-center border sm:size-9',
          radius,
          isLight
            ? 'border-black/10 bg-zinc-100 text-zinc-700'
            : 'border-white/12 bg-white/[0.08] text-white/80'
        )}
      >
        <Share2 className="size-3.5" />
      </motion.button>
    </>
  )
}

function ViewerActions({
  mode,
  creator,
  subscribed,
  onSubscribe,
  onShare,
  onCoffee,
  onCollab,
  onMessage,
  onVoiceCall,
  onVideoCall,
  prefersReducedMotion,
  appearance,
  radius,
  isLight,
}: {
  mode: ProfileViewerMode
  creator: PublicCreator
  subscribed: boolean
  onSubscribe: () => void
  onShare: () => void
  onCoffee?: () => void
  onCollab?: () => void
  onMessage?: () => void
  onVoiceCall?: () => void
  onVideoCall?: () => void
  prefersReducedMotion: boolean
  appearance: ProfileAppearance
  radius: string
  isLight: boolean
}) {
  const subscribeLabel = subscribed
    ? 'Subscribed'
    : mode === 'guest'
      ? 'Subscribe'
      : `Subscribe · ${formatCurrency(creator.monthlyPrice)}/mo`

  return (
    <>
      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        onClick={onSubscribe}
        className={cn(
          'inline-flex h-8 items-center justify-center px-5 text-[13px] font-semibold sm:h-9',
          radius,
          subscribed &&
            (isLight
              ? 'border border-black/10 bg-zinc-100 text-zinc-900'
              : 'border border-white/15 bg-white/[0.08] text-white')
        )}
        style={subscribed ? undefined : primaryButtonStyle(appearance, isLight)}
      >
        {subscribeLabel}
      </motion.button>

      {mode !== 'guest' && onMessage ? (
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          onClick={onMessage}
          aria-label="Message"
          className={cn(
            'inline-flex size-8 items-center justify-center border sm:size-9',
            radius,
            isLight
              ? 'border-black/10 bg-zinc-100 text-zinc-800'
              : 'border-white/12 bg-white/[0.08] text-white'
          )}
        >
          <MessageCircle className="size-3.5" />
        </motion.button>
      ) : null}

      {mode !== 'guest' && onVoiceCall ? (
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          onClick={onVoiceCall}
          aria-label="Start voice call"
          title="Voice call"
          className={cn(
            'inline-flex size-8 items-center justify-center border sm:size-9',
            radius,
            isLight
              ? 'border-black/10 bg-zinc-100 text-zinc-800'
              : 'border-white/12 bg-white/[0.08] text-white'
          )}
        >
          <Phone className="size-3.5" />
        </motion.button>
      ) : null}

      {mode !== 'guest' && onVideoCall ? (
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          onClick={onVideoCall}
          aria-label="Start video call"
          title="Video call"
          className={cn(
            'inline-flex size-8 items-center justify-center border sm:size-9',
            radius,
            isLight
              ? 'border-black/10 bg-zinc-100 text-zinc-800'
              : 'border-white/12 bg-white/[0.08] text-white'
          )}
        >
          <Video className="size-3.5" />
        </motion.button>
      ) : null}

      {onCoffee ? (
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          onClick={onCoffee}
          aria-label="Buy me a coffee"
          className={cn(
            'inline-flex size-8 items-center justify-center border sm:size-9',
            radius,
            isLight
              ? 'border-amber-700/20 bg-amber-50 text-amber-900'
              : 'border-amber-400/25 bg-amber-500/10 text-amber-100'
          )}
        >
          <Coffee className="size-3.5" />
        </motion.button>
      ) : null}

      {onCollab ? (
        <motion.button
          type="button"
          whileHover={prefersReducedMotion ? undefined : { y: -1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          onClick={onCollab}
          aria-label="Brand collaboration"
          title="Collab"
          className={cn(
            'inline-flex h-8 items-center gap-1.5 border px-3 text-[13px] font-semibold sm:h-9',
            radius,
            isLight
              ? 'border-sky-700/20 bg-sky-50 text-sky-900'
              : 'border-sky-400/25 bg-sky-500/10 text-sky-100'
          )}
        >
          <BriefcaseBusiness className="size-3.5" aria-hidden />
          Collab
        </motion.button>
      ) : null}

      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        onClick={onShare}
        aria-label="Share profile"
        className={cn(
          'inline-flex size-8 items-center justify-center border sm:size-9',
          radius,
          isLight
            ? 'border-black/10 bg-zinc-100 text-zinc-700'
            : 'border-white/12 bg-white/[0.08] text-white/80'
        )}
      >
        <Share2 className="size-3.5" />
      </motion.button>
    </>
  )
}
