import type {
  FloatingCardData,
  HeroBackground,
  HeroContentData,
  PhonePreviewData,
} from '@/components/hero/types'
import { phoneCreators, type PhoneShowcaseCreator } from '@/data/creators'

export const defaultHeroContent: HeroContentData = {
  italicLine: 'Build a Brand',
  boldLine: 'with the best link in bio.',
  description:
    'Linkme puts everything you sell—courses, ebooks, merch, products, even paid calls—into one link so fans can buy in seconds and you get paid fast.',
  ctaPrefix: 'link.me/',
  ctaPlaceholder: 'yourname',
  ctaButtonLabel: 'Start for free',
}

export const defaultHeroVideos = [
  '/videos/hero-1.mp4',
  '/videos/hero-2.mp4',
  '/videos/hero-3.mp4',
  '/videos/hero-4.mp4',
]

export const defaultHeroBackground: HeroBackground = {
  videos: defaultHeroVideos,
  overlayOpacity: 0.5,
}

export const HERO_SCENE_MS = 8000
export const HERO_CROSSFADE_SECONDS = 0.5

export interface HeroScene {
  id: string
  video: string
  creator: PhoneShowcaseCreator
  floatingCards: [FloatingCardData, FloatingCardData]
}

/** Synced hero moments — video + creator + floating cards advance together. */
export const heroScenes: HeroScene[] = [
  {
    id: 'scene-1',
    video: defaultHeroVideos[0]!,
    creator: phoneCreators[0]!,
    floatingCards: [
      {
        id: 's1-left',
        position: 'left',
        imageSrc: 'https://picsum.photos/id/1015/400/600',
        imageAlt: 'Training lifestyle',
      },
      {
        id: 's1-right',
        position: 'right',
        imageSrc: 'https://picsum.photos/id/64/400/600',
        imageAlt: 'Creator portrait',
      },
    ],
  },
  {
    id: 'scene-2',
    video: defaultHeroVideos[1]!,
    creator: phoneCreators[1]!,
    floatingCards: [
      {
        id: 's2-left',
        position: 'left',
        imageSrc: 'https://picsum.photos/id/1011/400/600',
        imageAlt: 'Fight night energy',
      },
      {
        id: 's2-right',
        position: 'right',
        imageSrc: 'https://picsum.photos/id/177/400/600',
        imageAlt: 'Athlete portrait',
      },
    ],
  },
  {
    id: 'scene-3',
    video: defaultHeroVideos[2]!,
    creator: phoneCreators[2]!,
    floatingCards: [
      {
        id: 's3-left',
        position: 'left',
        imageSrc: 'https://picsum.photos/id/1016/400/600',
        imageAlt: 'Stage lights',
      },
      {
        id: 's3-right',
        position: 'right',
        imageSrc: 'https://picsum.photos/id/1005/400/600',
        imageAlt: 'Performer portrait',
      },
    ],
  },
  {
    id: 'scene-4',
    video: defaultHeroVideos[3]!,
    creator: phoneCreators[3]!,
    floatingCards: [
      {
        id: 's4-left',
        position: 'left',
        imageSrc: 'https://picsum.photos/id/239/400/600',
        imageAlt: 'Lifestyle moment',
      },
      {
        id: 's4-right',
        position: 'right',
        imageSrc: 'https://picsum.photos/id/338/400/600',
        imageAlt: 'Creator portrait',
      },
    ],
  },
]

export const defaultPhonePreview: PhonePreviewData = {
  name: 'Ashton Hall',
  username: '@ashtonhall',
  verified: true,
  followersLabel: '38.8M Total Followers',
  coverImageSrc:
    'https://images.unsplash.com/photo-1530549387789-4c1017265635?auto=format&fit=crop&w=800&q=80',
  coverImageAlt: 'Creator on the water',
  avatarSrc:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  emailPlaceholder: 'your@email.com',
  connectLabel: 'Connect with',
  footerLabel: 'MY SOCIALS',
  socials: [
    { platform: 'instagram', href: '#', label: 'Instagram' },
    { platform: 'snapchat', href: '#', label: 'Snapchat' },
    { platform: 'youtube', href: '#', label: 'YouTube' },
    { platform: 'tiktok', href: '#', label: 'TikTok' },
    { platform: 'facebook', href: '#', label: 'Facebook' },
    { platform: 'x', href: '#', label: 'X' },
    { platform: 'link', href: '#', label: 'Website' },
  ],
  featureCard: {
    id: 'kick',
    title: 'KICK',
    subtitle: 'LIVE STREAM',
    href: '#',
    variant: 'kick',
  },
}

export const defaultFloatingCards: FloatingCardData[] = heroScenes[0]!.floatingCards
