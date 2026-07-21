export type CreatorSocialId =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'x'
  | 'twitch'
  | 'spotify'

export interface Creator {
  id: string
  name: string
  username: string
  followers: string
  coverImage: string
  profileImage: string
  verified: boolean
  socialLinks: CreatorSocialId[]
  bio: string
}

/** Single demo creator for landing/marketing placeholders. Real AI creators come from the API. */
export const creators: Creator[] = [
  {
    id: '1',
    name: 'Ashton Hall',
    username: '@ashtonhall',
    followers: '2.4M',
    coverImage: 'https://picsum.photos/id/1015/640/860',
    profileImage: 'https://picsum.photos/id/64/200/200',
    verified: true,
    socialLinks: ['instagram', 'tiktok', 'youtube'],
    bio: 'Athlete · entrepreneur · building in public.',
  },
]

/** Top marquee track */
export const creatorsRowOne = creators

/** Bottom marquee track */
export const creatorsRowTwo = creators

/* -------------------------------------------------------------------------- */
/* Hero phone showcase creators (auto-rotating PhonePreview)                  */
/* -------------------------------------------------------------------------- */

export type PhoneSocialPlatform =
  | 'instagram'
  | 'x'
  | 'facebook'
  | 'spotify'
  | 'youtube'
  | 'snapchat'
  | 'tiktok'
  | 'kick'
  | 'link'

export interface PhoneSocialLink {
  platform: PhoneSocialPlatform
  href: string
  label: string
}

export interface PhoneFeaturedCard {
  id: string
  title: string
  subtitle?: string
  href?: string
  imageSrc?: string
  imageAlt?: string
  variant?: 'kick' | 'default'
}

export interface PhoneShowcaseCreator {
  id: string
  name: string
  username: string
  verified: boolean
  followers: string
  bio: string
  profileImage: string
  coverImage: string
  emailPlaceholder: string
  socialLinks: PhoneSocialLink[]
  featuredCards: PhoneFeaturedCard[]
}

function picsumCover(id: number) {
  return `https://picsum.photos/id/${id}/800/1000`
}

function picsumAvatar(id: number) {
  return `https://picsum.photos/id/${id}/200/200`
}

/** One demo phone profile for the landing hero. */
export const phoneCreators: PhoneShowcaseCreator[] = [
  {
    id: 'ashton-hall',
    name: 'Ashton Hall',
    username: '@ashtonhall',
    verified: true,
    followers: '38.8M',
    bio: 'Athlete · entrepreneur · building in public.',
    profileImage: picsumAvatar(64),
    coverImage: picsumCover(1015),
    emailPlaceholder: 'your@email.com',
    socialLinks: [
      { platform: 'instagram', href: '#', label: 'Instagram' },
      { platform: 'snapchat', href: '#', label: 'Snapchat' },
      { platform: 'youtube', href: '#', label: 'YouTube' },
      { platform: 'tiktok', href: '#', label: 'TikTok' },
      { platform: 'facebook', href: '#', label: 'Facebook' },
      { platform: 'x', href: '#', label: 'X' },
      { platform: 'link', href: '#', label: 'Website' },
    ],
    featuredCards: [
      {
        id: 'kick',
        title: 'KICK',
        subtitle: 'LIVE STREAM',
        href: '#',
        variant: 'kick',
      },
    ],
  },
]
