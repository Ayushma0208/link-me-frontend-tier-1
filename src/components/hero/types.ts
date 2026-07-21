export type SocialPlatform =
  | 'instagram'
  | 'x'
  | 'facebook'
  | 'spotify'
  | 'apple'
  | 'linkedin'
  | 'youtube'
  | 'snapchat'
  | 'tiktok'
  | 'kick'
  | 'link'

export interface HeroSocialLink {
  platform: SocialPlatform
  href: string
  label: string
}

export interface HeroLinkCard {
  id: string
  title: string
  href: string
  imageSrc: string
  imageAlt: string
  icon?: SocialPlatform
}

export interface PhoneFeatureCard {
  id: string
  title: string
  subtitle?: string
  href?: string
  imageSrc?: string
  imageAlt?: string
  variant?: 'kick' | 'default'
}

export interface PhonePreviewData {
  name: string
  username: string
  verified?: boolean
  followersLabel: string
  coverImageSrc: string
  coverImageAlt: string
  avatarSrc: string
  socials: HeroSocialLink[]
  emailPlaceholder?: string
  connectLabel?: string
  featureCard: PhoneFeatureCard
  footerLabel?: string
}

export interface FloatingCardData {
  id: string
  imageSrc: string
  imageAlt: string
  position: 'left' | 'right'
}

export interface HeroContentData {
  italicLine: string
  boldLine: string
  description: string
  ctaPlaceholder: string
  ctaPrefix: string
  ctaButtonLabel: string
}

export interface HeroBackground {
  /** @deprecated Prefer `videos` — kept for one-off single-source usage */
  src?: string
  videos?: string[]
  poster?: string
  overlayOpacity?: number
}
