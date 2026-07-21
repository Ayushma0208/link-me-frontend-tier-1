'use client'

import Image from 'next/image'
import { Coffee, MapPin } from 'lucide-react'

import {
  buttonRadiusClass,
  fontFamilyFor,
  publicProfileUrl,
  themeSurface,
  withAlpha,
  type ProfileAppearance,
} from '@/lib/profile-appearance'
import { cn, formatCurrency } from '@/lib/utils'

export interface ProfileThemePreviewProps {
  displayName: string
  username: string
  bio: string
  avatar: string
  appearance: ProfileAppearance
  category?: string
  location?: string
  customLinkLabel?: string
  customLinkUrl?: string
  coffeeEnabled?: boolean
  coffeeButtonText?: string
  subscriptionEnabled?: boolean
  subscriptionPrice?: number
  className?: string
}

export function ProfileThemePreview({
  displayName,
  username,
  bio,
  avatar,
  appearance,
  category,
  location,
  customLinkLabel,
  customLinkUrl,
  coffeeEnabled = true,
  coffeeButtonText = 'Buy me a coffee',
  subscriptionEnabled = true,
  subscriptionPrice = 299,
  className,
}: ProfileThemePreviewProps) {
  const surface = themeSurface(appearance.theme)
  const radius = buttonRadiusClass(appearance.buttonStyle)
  const primaryStyle =
    appearance.buttonStyle === 'outline'
      ? {
          color: appearance.accent,
          boxShadow: `inset 0 0 0 1.5px ${appearance.accent}`,
          background: 'transparent',
        }
      : appearance.buttonStyle === 'soft'
        ? {
            background: withAlpha(appearance.accent, 0.28),
            color: appearance.theme === 'light' ? '#18181b' : '#fff',
          }
        : {
            background: `linear-gradient(135deg, ${appearance.accent}, ${withAlpha(appearance.accent, 0.7)})`,
            color: '#fff',
          }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[24px] border',
        surface.border,
        className
      )}
      style={{ fontFamily: fontFamilyFor(appearance.font) }}
    >
      <div
        className={cn('relative', surface.page)}
        style={
          appearance.theme === 'gradient'
            ? {
                backgroundImage: `radial-gradient(ellipse at top, ${withAlpha(appearance.accent, 0.35)}, transparent 55%), linear-gradient(180deg, #0a0612, #120818)`,
              }
            : undefined
        }
      >
        <div className="relative h-28 overflow-hidden">
          {appearance.coverType === 'video' ? (
            <video
              src={appearance.coverVideo}
              muted
              loop
              playsInline
              autoPlay
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <Image
              src={appearance.coverImage}
              alt=""
              fill
              sizes="400px"
              className="object-cover"
            />
          )}
          <div
            className={cn(
              'absolute inset-0',
              appearance.theme === 'light'
                ? 'bg-gradient-to-t from-[#f4f4f7] via-black/20 to-transparent'
                : 'bg-gradient-to-t from-black via-black/40 to-transparent'
            )}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `linear-gradient(135deg, ${withAlpha(appearance.accent, 0.45)}, transparent 60%)`,
            }}
          />
        </div>

        <div className="relative -mt-8 px-4 pb-5">
          <div
            className={cn(
              'relative size-14 overflow-hidden rounded-2xl border-2',
              appearance.theme === 'light' ? 'border-white' : 'border-black'
            )}
          >
            <Image src={avatar} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <p
            className={cn(
              'mt-3 text-[16px] font-extrabold tracking-tight',
              surface.text
            )}
          >
            {displayName || 'Display name'}
          </p>
          <p className="text-[12px]" style={{ color: appearance.accent }}>
            @{username || 'username'}
          </p>
          {(category || location) && (
            <div
              className={cn(
                'mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]',
                surface.muted
              )}
            >
              {category ? <span>{category}</span> : null}
              {category && location ? <span>·</span> : null}
              {location ? (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="size-3" />
                  {location}
                </span>
              ) : null}
            </div>
          )}
          <p
            className={cn(
              'mt-2 line-clamp-3 text-[12px] leading-relaxed',
              surface.muted
            )}
          >
            {bio || 'Your bio appears here.'}
          </p>
          <p className={cn('mt-3 text-[11px]', surface.muted)}>
            {publicProfileUrl(username)}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {subscriptionEnabled ? (
              <button
                type="button"
                className={cn('h-9 w-full px-3 text-[12px] font-semibold', radius)}
                style={primaryStyle}
              >
                Subscribe · {formatCurrency(subscriptionPrice)}/mo
              </button>
            ) : null}
            <div className="flex gap-2">
              {coffeeEnabled ? (
                <button
                  type="button"
                  className={cn(
                    'inline-flex h-9 flex-1 items-center justify-center gap-1.5 px-3 text-[12px] font-semibold',
                    radius,
                    appearance.theme === 'light'
                      ? 'border border-amber-500/30 bg-amber-50 text-amber-900'
                      : 'border border-amber-400/25 bg-amber-500/15 text-amber-100'
                  )}
                >
                  <Coffee className="size-3.5" />
                  {coffeeButtonText || 'Coffee'}
                </button>
              ) : null}
              <button
                type="button"
                className={cn(
                  'h-9 flex-1 px-3 text-[12px] font-semibold',
                  radius,
                  appearance.theme === 'light'
                    ? 'border border-black/10 bg-white text-zinc-900'
                    : 'border border-white/15 bg-white/10 text-white'
                )}
              >
                Follow
              </button>
            </div>
            {customLinkLabel && customLinkUrl ? (
              <button
                type="button"
                className={cn(
                  'h-9 w-full truncate px-3 text-[12px] font-semibold',
                  radius,
                  appearance.theme === 'light'
                    ? 'border border-black/10 bg-black/[0.03] text-zinc-800'
                    : 'border border-white/12 bg-white/[0.06] text-white'
                )}
              >
                {customLinkLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
