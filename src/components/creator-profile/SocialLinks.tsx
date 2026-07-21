'use client'

import type { ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'

import type { CreatorSocialId } from '@/data/creators'
import { SOCIAL_DEMO_URLS } from '@/data/public-creator'
import { cn } from '@/lib/utils'

const SOCIAL_ICON: Record<
  CreatorSocialId,
  ComponentType<{ className?: string }>
> = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  x: FaXTwitter,
  twitch: FaTwitch,
  spotify: FaSpotify,
}

const SOCIAL_LABEL: Record<CreatorSocialId, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  twitch: 'Twitch',
  spotify: 'Spotify',
}

export interface SocialLinksProps {
  links: CreatorSocialId[]
  handle?: string
  className?: string
}

export function SocialLinks({ links, handle = 'creator', className }: SocialLinksProps) {
  const prefersReducedMotion = useReducedMotion()

  if (!links.length) return null

  return (
    <div className={cn('flex flex-wrap gap-2.5', className)}>
      {links.map((social) => {
        const Icon = SOCIAL_ICON[social]
        const href = SOCIAL_DEMO_URLS[social](handle.replace(/^@/, ''))
        return (
          <motion.a
            key={social}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={SOCIAL_LABEL[social]}
            title={SOCIAL_LABEL[social]}
            whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.05 }}
            className={cn(
              'flex size-11 items-center justify-center rounded-full',
              'border border-white/12 bg-white/[0.05] text-white/75',
              'backdrop-blur-md transition-colors',
              'hover:border-white/25 hover:bg-white/[0.1] hover:text-white'
            )}
          >
            <Icon className="size-4" />
          </motion.a>
        )
      })}
    </div>
  )
}
