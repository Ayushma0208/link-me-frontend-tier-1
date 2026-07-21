import { creators, type CreatorSocialId } from '@/data/creators'
import type { StoryItem } from '@/data/stories'

export interface PublicCreatorStats {
  followers: number
  following: number
  subscribers: number
  posts?: number
}

export interface PublicHighlight {
  id: string
  title: string
  coverUrl: string
  /** Media slides opened when tapping a highlight. */
  stories: StoryItem[]
  /** Premium highlights lock for non-subscribers. */
  premium?: boolean
}

export interface PublicPost {
  id: string
  title: string
  caption: string
  mediaUrl: string
  thumbnailUrl: string
  type: 'image' | 'video'
  locked: boolean
  unlockReason?: string | null
  price: number
  likes: number
}

export interface PublicStoreItem {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
  badge?: string
}

export interface PublicCaseStudy {
  id: string
  brand: string
  title: string
  summary: string
  coverImage: string
  problem: string
  solution: string
  results: string
  metrics?: Array<{ label: string; value: string }>
  industry?: string
}

export interface PublicEvent {
  id: string
  title: string
  location: string
  /** ISO datetime from API — used for ticket date stub. */
  startsAt?: string
  /** External ticket URL (BookMyShow, Meetup, etc.) or in-app live path. */
  ticketUrl?: string
  /** Ticket link vs in-app live session. */
  kind?: 'TICKET' | 'LIVE'
  liveId?: string
  liveStatus?: 'SCHEDULED' | 'LIVE' | 'ENDED'
  accessType?: 'FREE' | 'PAID'
  price?: number | null
  /** Legacy demo fields */
  dateLabel?: string
  imageUrl?: string
  priceLabel?: string
}

export interface PublicCreator {
  id: string
  name: string
  handle: string
  avatar: string
  coverImage: string
  verified: boolean
  bio: string
  longBio: string
  location: string
  joinedLabel: string
  category: string
  socialLinks: CreatorSocialId[]
  stats: PublicCreatorStats
  monthlyPrice: number
  /** Live subscription plan UUID when loaded from API. */
  planId?: string | null
  /** Live creator profile UUID when loaded from API. */
  creatorProfileId?: string | null
  /** One-time chat unlock price (INR). */
  chatPrice?: number
  /** Voice call price per minute (INR). */
  voiceCallPrice?: number
  /** Video call price per minute (INR). */
  videoCallPrice?: number
  postPrice: number
  coffeePrice: number
  /** Cal.com booking page URL for availability calendar. */
  bookingUrl?: string | null
  /** Active ephemeral stories for the public stories rail. */
  stories: StoryItem[]
  highlights: PublicHighlight[]
  posts: PublicPost[]
  store: PublicStoreItem[]
  caseStudies: PublicCaseStudy[]
  events: PublicEvent[]
}

export const SOCIAL_DEMO_URLS: Record<CreatorSocialId, (handle: string) => string> =
  {
    instagram: (h) => `https://instagram.com/${h}`,
    tiktok: (h) => `https://tiktok.com/@${h}`,
    youtube: (h) => `https://youtube.com/@${h}`,
    x: (h) => `https://x.com/${h}`,
    twitch: (h) => `https://twitch.tv/${h}`,
    spotify: (h) => `https://open.spotify.com/user/${h}`,
  }

function handleOf(username: string) {
  return username.replace(/^@/, '').toLowerCase()
}

function followersToNumber(followers: string) {
  const raw = followers.trim().toUpperCase()
  if (raw.endsWith('M')) return Math.round(parseFloat(raw) * 1_000_000)
  if (raw.endsWith('K')) return Math.round(parseFloat(raw) * 1_000)
  return Number.parseInt(raw.replace(/,/g, ''), 10) || 0
}

const LONG_BIOS = [
  'Building a premium fitness community with exclusive training plans, live sessions, and member-only drops. Join for weekly programs and behind-the-scenes access.',
  'Producer and songwriter sharing unreleased cuts, sample packs, and studio sessions. Subscribe for early listens and private Q&As.',
  'Beauty creator focused on product education, tutorials, and exclusive lookbooks. Unlock the full archive and seasonal member kits.',
]

const CATEGORIES = ['Fitness', 'Music', 'Beauty', 'Gaming', 'Lifestyle', 'Tech', 'Fashion']

function buildCaseStudies(handle: string, seed: number, category: string): PublicCaseStudy[] {
  const covers = [1015, 1016, 1018, 1025, 1035, 1040]
  return [
    {
      id: `cs-${handle}-1`,
      brand: 'Nova Beauty',
      title: 'Launch week content system',
      summary:
        'Turned a product drop into a week-long narrative that drove waitlist conversions.',
      coverImage: `https://picsum.photos/id/${covers[seed % covers.length]!}/900/600`,
      industry: category,
      problem:
        'The brand had a strong product but weak launch storytelling. Organic reach stalled and paid traffic bounced without a clear journey.',
      solution:
        'Built a Problem → Proof → Product arc across Reels, Stories, and a member-only Q&A. Pairing authentic creator voice with a tight CTA sequence.',
      results:
        'Waitlist filled in 72 hours. Creators reported higher comment quality and brand partners renewed for a second drop.',
      metrics: [
        { label: 'Reach', value: '+2.1M' },
        { label: 'CTR', value: '4.8%' },
        { label: 'Sales lift', value: '+31%' },
      ],
    },
    {
      id: `cs-${handle}-2`,
      brand: 'Atlas Athletic',
      title: '30-day challenge funnel',
      summary:
        'Grew a fitness challenge into a subscription pipeline without sounding salesy.',
      coverImage: `https://picsum.photos/id/${covers[(seed + 2) % covers.length]!}/900/600`,
      industry: 'Fitness',
      problem:
        'Challenge signups were high, but conversion to paid membership was low after day 7.',
      solution:
        'Redesigned the challenge as a case-style journey: daily proof posts, mid-funnel live check-ins, and exclusive progress templates for members.',
      results:
        'Membership conversion nearly doubled. Brands used the format as a reusable playbook for seasonal campaigns.',
      metrics: [
        { label: 'Signups', value: '18.4k' },
        { label: 'Conv.', value: '2.1×' },
        { label: 'Retention', value: '67%' },
      ],
    },
    {
      id: `cs-${handle}-3`,
      brand: 'Northline Co.',
      title: 'Collab that justified premium rates',
      summary:
        'Documented a brand partnership end-to-end so future deals could price on outcomes, not guesses.',
      coverImage: `https://picsum.photos/id/${covers[(seed + 4) % covers.length]!}/900/600`,
      industry: 'Lifestyle',
      problem:
        'Past collabs looked good creatively but lacked measurable proof when negotiating rates.',
      solution:
        'Structured the campaign as a case study from day one: clear hypothesis, content pillars, and result snapshots shared with the brand weekly.',
      results:
        'Closed renewal at a higher package rate. Portfolio now anchors pitch decks for agency and brand partners.',
      metrics: [
        { label: 'Engagement', value: '+86%' },
        { label: 'Saves', value: '12.3k' },
        { label: 'Deal value', value: '+40%' },
      ],
    },
  ]
}

function buildPosts(seed: number, _monthlyPrice: number): PublicPost[] {
  return Array.from({ length: 9 }, (_, index) => {
    const mediaId = 420 + seed * 11 + index
    const locked = index >= 2
    return {
      id: `pub-post-${seed}-${index}`,
      title: locked ? `Exclusive drop ${index + 1}` : `Free preview ${index + 1}`,
      caption: locked
        ? 'Members-only content. Unlock this post or subscribe for full access.'
        : 'A free preview of what’s inside the membership.',
      mediaUrl: `https://picsum.photos/id/${mediaId}/900/1100`,
      thumbnailUrl: `https://picsum.photos/id/${mediaId}/600/750`,
      type: (index % 4 === 0 ? 'video' : 'image') as PublicPost['type'],
      locked,
      price: locked ? 49 : 0,
      likes: 800 + seed * 40 + index * 17,
    }
  })
}

function buildStories(seed: number): StoryItem[] {
  return [
    {
      id: `story-${seed}-a`,
      mediaUrl: `https://picsum.photos/id/${180 + (seed % 40)}/720/1280`,
      type: 'image',
      durationMs: 5000,
    },
    {
      id: `story-${seed}-b`,
      mediaUrl: `/videos/hero-${(seed % 4) + 1}.mp4`,
      type: 'video',
      durationMs: 8000,
    },
    {
      id: `story-${seed}-c`,
      mediaUrl: `https://picsum.photos/id/${210 + (seed % 30)}/720/1280`,
      type: 'image',
      durationMs: 5000,
    },
  ]
}

function buildHighlights(handle: string, seed: number): PublicHighlight[] {
  return ['BTS', 'Drops', 'Live', 'Tips', 'Members'].map((title, i) => {
    const coverId = 150 + seed * 3 + i
    const premium = i >= 2
    return {
      id: `hl-${handle}-${i}`,
      title,
      coverUrl: `https://picsum.photos/id/${coverId}/200/200`,
      premium,
      stories: [
        {
          id: `hl-${handle}-${i}-1`,
          mediaUrl: `https://picsum.photos/id/${coverId}/720/1280`,
          type: 'image',
          durationMs: 5000,
        },
        {
          id: `hl-${handle}-${i}-2`,
          mediaUrl: `https://picsum.photos/id/${coverId + 8}/720/1280`,
          type: 'image',
          durationMs: 5000,
        },
      ],
    }
  })
}

export const publicCreators: PublicCreator[] = creators.map((creator, index) => {
  const handle = handleOf(creator.username)
  const monthlyPrice = [299, 499, 799, 999, 399, 599][index % 6]!
  const seed = Number(creator.id) || index + 1

  return {
    id: creator.id,
    name: creator.name,
    handle,
    avatar: creator.profileImage,
    coverImage: creator.coverImage,
    verified: creator.verified,
    bio: creator.bio,
    longBio: LONG_BIOS[index % LONG_BIOS.length]!,
    location: ['Los Angeles', 'New York', 'London', 'Tokyo', 'Mumbai'][index % 5]!,
    joinedLabel: 'Joined 2024',
    category: CATEGORIES[index % CATEGORIES.length]!,
    socialLinks: creator.socialLinks,
    stats: {
      followers: followersToNumber(creator.followers),
      following: 120 + index * 17,
      subscribers: 2400 + index * 310,
      posts: 12 + index * 3,
    },
    monthlyPrice,
    voiceCallPrice: 99,
    videoCallPrice: 149,
    postPrice: 49,
    coffeePrice: [99, 149, 79, 199][index % 4]!,
    stories: buildStories(seed),
    highlights: buildHighlights(handle, seed),
    posts: buildPosts(seed, monthlyPrice),
    store: [
      {
        id: `store-${handle}-1`,
        title: 'Premium Pack',
        description: 'Downloadable templates, guides, and bonuses.',
        price: 799,
        imageUrl: `https://picsum.photos/id/${220 + seed}/600/600`,
        badge: 'Popular',
      },
      {
        id: `store-${handle}-2`,
        title: '1:1 Session',
        description: 'Private coaching call with actionable feedback.',
        price: 2499,
        imageUrl: `https://picsum.photos/id/${230 + seed}/600/600`,
      },
      {
        id: `store-${handle}-3`,
        title: 'Digital Lookbook',
        description: 'High-res gallery + usage rights for fans.',
        price: 399,
        imageUrl: `https://picsum.photos/id/${240 + seed}/600/600`,
        badge: 'New',
      },
    ],
    caseStudies: buildCaseStudies(handle, seed, CATEGORIES[index % CATEGORIES.length]!),
    events: [
      {
        id: `event-${handle}-1`,
        title: 'Live Member Night',
        dateLabel: 'Sat · 8:00 PM IST',
        location: 'Online · Zoom',
        imageUrl: `https://picsum.photos/id/${250 + seed}/800/500`,
        priceLabel: 'Included',
      },
      {
        id: `event-${handle}-2`,
        title: 'Creator Meetup',
        dateLabel: 'Next month',
        location: 'City studio',
        imageUrl: `https://picsum.photos/id/${260 + seed}/800/500`,
        priceLabel: '₹999',
      },
    ],
  }
})

export const publicCreatorsByHandle = Object.fromEntries(
  publicCreators.map((c) => [c.handle, c])
) as Record<string, PublicCreator>

/** Friendly demo URLs — marketing aliases over the single placeholder creator. */
const ALIASES: Record<string, PublicCreator> = {
  richforever: {
    ...publicCreators[0]!,
    id: 'alias-richforever',
    name: 'Rick Ross',
    handle: 'richforever',
    bio: 'MMG · albums · tours · the boss experience.',
    category: 'Music',
    avatar: 'https://picsum.photos/id/177/200/200',
    coverImage: 'https://picsum.photos/id/1011/1600/900',
  },
  kyliefit: {
    ...publicCreators[0]!,
    id: 'alias-kyliefit',
    name: 'Kylie Fit',
    handle: 'kyliefit',
    bio: 'Training plans, live sessions, and member-only drops.',
    category: 'Fitness',
    avatar: 'https://picsum.photos/id/64/200/200',
    coverImage: 'https://picsum.photos/id/1015/1600/900',
  },
  johndoe: {
    ...publicCreators[0]!,
    id: 'alias-johndoe',
    name: 'John Doe',
    handle: 'johndoe',
    bio: 'Creator · photographer · stories from the road.',
    category: 'Lifestyle',
    avatar: 'https://picsum.photos/id/91/200/200',
    coverImage: 'https://picsum.photos/id/1016/1600/900',
  },
}

export function getPublicCreator(username: string): PublicCreator | null {
  const handle = username.replace(/^@/, '').toLowerCase()
  return publicCreatorsByHandle[handle] ?? ALIASES[handle] ?? null
}

export function buildCustomPublicCreator(
  handle: string,
  overrides?: Partial<
    Pick<
      PublicCreator,
      'name' | 'avatar' | 'bio' | 'longBio' | 'coverImage' | 'location' | 'category'
    >
  >
): PublicCreator {
  const name = overrides?.name || handle
  return {
    id: `custom-${handle}`,
    name,
    handle,
    avatar:
      overrides?.avatar ||
      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
    coverImage:
      overrides?.coverImage ||
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
    verified: false,
    bio: overrides?.bio || 'Creator on Link.me',
    longBio:
      overrides?.longBio ||
      overrides?.bio ||
      'Building a premium creator page with exclusive posts, stories, and member drops.',
    location: overrides?.location || '',
    joinedLabel: 'Joined 2026',
    category: overrides?.category || 'Creator',
    socialLinks: ['instagram', 'tiktok', 'youtube', 'x'],
    stats: {
      followers: 0,
      following: 0,
      subscribers: 0,
    },
    monthlyPrice: 299,
    voiceCallPrice: 99,
    videoCallPrice: 149,
    postPrice: 49,
    coffeePrice: 99,
    bookingUrl: null,
    stories: [],
    highlights: [],
    posts: [],
    store: [],
    caseStudies: buildCaseStudies(
      handle,
      handle.length,
      overrides?.category || 'Creator'
    ),
    events: [],
  }
}

export const PUBLIC_PROFILE_RESERVED = new Set([
  'login',
  'register',
  'signup',
  'admin',
  'influencer',
  'user',
  'api',
  'videos',
  'images',
])
