import { creators, type Creator, type CreatorSocialId } from '@/data/creators'

export type FeedSource = 'following' | 'subscribed' | 'trending'
export type FeedPostType = 'image' | 'video' | 'reel'
export type FeedLockKind = 'subscribers' | 'ppv'
export type ExploreCategory =
  | 'For You'
  | 'Fitness'
  | 'Gaming'
  | 'Music'
  | 'Finance'
  | 'Travel'
  | 'Comedy'
  | 'Technology'
  | 'Food'
  | 'Fashion'

export type ExploreMediaType = 'image' | 'video' | 'reel'

export interface FeedCreator {
  id: string
  name: string
  username: string
  handle: string
  avatar: string
  coverImage: string
  bio: string
  verified: boolean
  followers: number
  category: ExploreCategory
  socialLinks: CreatorSocialId[]
  monthlyPrice: number
  isFollowing: boolean
  isSubscribed: boolean
  hasStory: boolean
  storySeen: boolean
}

export interface FeedStory {
  id: string
  creatorId: string
  mediaUrl: string
  type: 'image' | 'video'
  createdAt: string
}

export interface FeedPost {
  id: string
  creatorId: string
  title: string
  caption: string
  mediaUrl: string
  /** Carousel slides (image posts). Falls back to [mediaUrl]. */
  mediaUrls?: string[]
  thumbnailUrl: string
  blurredThumbnailUrl: string
  /** Local or remote video file for video/reel posts. */
  videoUrl?: string
  type: FeedPostType
  locked: boolean
  /** subscribers = membership gate, ppv = one-time unlock */
  lockKind?: FeedLockKind | null
  price: number | null
  likes: number
  comments: number
  hashtags?: string[]
  source: FeedSource
  createdAt: string
}

export interface CreatorProfilePost {
  id: string
  title: string
  mediaUrl: string
  thumbnailUrl: string
  blurredThumbnailUrl: string
  type: 'image' | 'video'
  locked: boolean
  unlockReason?: string | null
  price: number
}

export interface ExploreItem {
  id: string
  creatorId: string
  title: string
  imageUrl: string
  videoUrl?: string
  mediaType: ExploreMediaType
  category: ExploreCategory
  aspect: 'square' | 'portrait' | 'wide'
  locked: boolean
  price: number | null
}

function handleOf(username: string) {
  return username.replace(/^@/, '')
}

function followersToNumber(followers: string) {
  const raw = followers.trim().toUpperCase()
  if (raw.endsWith('M')) return Math.round(parseFloat(raw) * 1_000_000)
  if (raw.endsWith('K')) return Math.round(parseFloat(raw) * 1_000)
  return Number.parseInt(raw.replace(/,/g, ''), 10) || 0
}

const CATEGORY_BY_INDEX: ExploreCategory[] = [
  'Fitness',
  'Music',
  'Fashion',
  'Gaming',
  'Travel',
  'Technology',
  'Comedy',
  'Food',
  'Finance',
  'Fitness',
  'Travel',
  'Music',
]

const MONTHLY_PRICES = [299, 499, 799, 999, 1499, 1999, 399, 599, 899, 1299, 699, 1099]

/** Demo follow for the single placeholder creator. Real follows come from live creators. */
export const DEMO_FOLLOWING_IDS = ['1'] as const

export const DEMO_SUBSCRIBED_IDS = [] as const

export const feedCreators: FeedCreator[] = creators.map((creator: Creator, index) => {
  const id = creator.id
  return {
    id,
    name: creator.name,
    username: creator.username,
    handle: handleOf(creator.username),
    avatar: creator.profileImage,
    coverImage: creator.coverImage,
    bio: creator.bio,
    verified: creator.verified,
    followers: followersToNumber(creator.followers),
    category: CATEGORY_BY_INDEX[index % CATEGORY_BY_INDEX.length]!,
    socialLinks: creator.socialLinks,
    monthlyPrice: MONTHLY_PRICES[index % MONTHLY_PRICES.length]!,
    isFollowing: DEMO_FOLLOWING_IDS.includes(id as (typeof DEMO_FOLLOWING_IDS)[number]),
    isSubscribed: DEMO_SUBSCRIBED_IDS.includes(id as (typeof DEMO_SUBSCRIBED_IDS)[number]),
    hasStory: index % 3 !== 2,
    storySeen: index % 4 === 0,
  }
})

export const feedCreatorsById = Object.fromEntries(
  feedCreators.map((creator) => [creator.id, creator])
) as Record<string, FeedCreator>

export const feedCreatorsByHandle = Object.fromEntries(
  feedCreators.map((creator) => [creator.handle, creator])
) as Record<string, FeedCreator>

export const feedStories: FeedStory[] = feedCreators
  .filter((c) => c.hasStory)
  .flatMap((creator, index) => [
    {
      id: `story-${creator.id}-1`,
      creatorId: creator.id,
      mediaUrl: `https://picsum.photos/id/${200 + index}/720/1280`,
      type: 'image' as const,
      createdAt: new Date(Date.now() - index * 36e5).toISOString(),
    },
    {
      id: `story-${creator.id}-2`,
      creatorId: creator.id,
      mediaUrl: `https://picsum.photos/id/${310 + index}/720/1280`,
      type: 'image' as const,
      createdAt: new Date(Date.now() - index * 36e5 - 18e5).toISOString(),
    },
  ])

const CAPTIONS = [
  'Exclusive drop for members only — swipe for the full set.',
  'Behind the scenes from today. More in the vault.',
  'New tutorial live. Subscribe to unlock the full cut.',
  'Weekend vibes. Unlock for the uncut version.',
  'Premium rehearsal footage just dropped.',
  'Member-only lookbook preview.',
]

const HASHTAG_SETS = [
  ['exclusive', 'drop', 'members'],
  ['bts', 'studio', 'creator'],
  ['tutorial', 'tips', 'learn'],
  ['vibe', 'weekend', 'lifestyle'],
  ['reels', 'premiere', 'music'],
  ['lookbook', 'fashion', 'style'],
]

const HERO_VIDEOS = [
  '/videos/hero-1.mp4',
  '/videos/hero-2.mp4',
  '/videos/hero-3.mp4',
  '/videos/hero-4.mp4',
] as const

export const feedPosts: FeedPost[] = feedCreators.flatMap((creator, creatorIndex) => {
  const sources: FeedSource[] = creator.isSubscribed
    ? ['subscribed', 'following', 'trending']
    : creator.isFollowing
      ? ['following', 'trending', 'trending']
      : ['trending', 'trending', 'following']

  return [0, 1, 2].map((postIndex) => {
    const locked = !(creator.isSubscribed && postIndex === 0) && postIndex > 0
    const mediaId = 400 + creatorIndex * 3 + postIndex
    const type: FeedPostType =
      postIndex === 1 ? 'video' : postIndex === 2 && creatorIndex % 2 === 0 ? 'reel' : 'image'
    return {
      id: `post-${creator.id}-${postIndex}`,
      creatorId: creator.id,
      title: `${creator.name.split(' ')[0]} · Drop ${postIndex + 1}`,
      caption: CAPTIONS[(creatorIndex + postIndex) % CAPTIONS.length]!,
      mediaUrl: `https://picsum.photos/id/${mediaId}/900/1100`,
      mediaUrls:
        type === 'image'
          ? [
              `https://picsum.photos/id/${mediaId}/900/1100`,
              `https://picsum.photos/id/${((mediaId + 11) % 199) + 1}/900/1100`,
              `https://picsum.photos/id/${((mediaId + 23) % 199) + 1}/900/1100`,
            ]
          : undefined,
      thumbnailUrl: `https://picsum.photos/id/${mediaId}/600/750`,
      blurredThumbnailUrl: `https://picsum.photos/id/${mediaId}/40/50`,
      videoUrl: type !== 'image' ? HERO_VIDEOS[creatorIndex % HERO_VIDEOS.length] : undefined,
      type,
      locked,
      lockKind: locked
        ? postIndex === 1
          ? ('subscribers' as const)
          : ('ppv' as const)
        : null,
      price: locked ? [99, 99, 149][postIndex % 3]! : null,
      likes: 1200 + creatorIndex * 137 + postIndex * 41,
      comments: 40 + creatorIndex * 7 + postIndex * 3,
      hashtags: HASHTAG_SETS[(creatorIndex + postIndex) % HASHTAG_SETS.length],
      source: sources[postIndex]!,
      createdAt: new Date(Date.now() - (creatorIndex * 3 + postIndex) * 72e5).toISOString(),
    }
  })
})

export function getCreatorProfilePosts(creatorId: string): CreatorProfilePost[] {
  const creator = feedCreatorsById[creatorId]
  if (!creator) return []

  return Array.from({ length: 9 }, (_, index) => {
    const mediaId = 500 + Number(creatorId) * 10 + index
    const locked = index >= 2 && !creator.isSubscribed
    return {
      id: `profile-post-${creatorId}-${index}`,
      title: `Post ${index + 1}`,
      mediaUrl: `https://picsum.photos/id/${mediaId}/800/800`,
      thumbnailUrl: `https://picsum.photos/id/${mediaId}/600/600`,
      blurredThumbnailUrl: `https://picsum.photos/id/${mediaId}/40/40`,
      type: index % 4 === 0 ? ('video' as const) : ('image' as const),
      locked,
      price: locked ? creator.monthlyPrice : 0,
    }
  })
}

export const exploreCategories: ExploreCategory[] = [
  'For You',
  'Fitness',
  'Gaming',
  'Music',
  'Finance',
  'Travel',
  'Comedy',
  'Technology',
  'Food',
  'Fashion',
]

const ASPECTS: ExploreItem['aspect'][] = ['portrait', 'square', 'wide', 'portrait', 'square']
const MEDIA_CYCLE: ExploreMediaType[] = ['image', 'image', 'video', 'reel', 'image', 'reel']

export function buildExplorePage(page: number, category: ExploreCategory): ExploreItem[] {
  const pool =
    category === 'For You'
      ? feedCreators
      : feedCreators.filter((c) => c.category === category)

  const pageSize = 18
  const categoryKey = category.replace(/\s+/g, '-').toLowerCase()
  return Array.from({ length: pageSize }, (_, i) => {
    const globalIndex = page * pageSize + i
    const creator = pool[globalIndex % Math.max(pool.length, 1)] ?? feedCreators[0]!
    const mediaId = 600 + ((globalIndex * 17) % 199) + 1
    const mediaType = MEDIA_CYCLE[globalIndex % MEDIA_CYCLE.length]!
    return {
      id: `explore-${categoryKey}-${globalIndex}`,
      creatorId: creator.id,
      title: `${creator.name} · ${category === 'For You' ? creator.category : category}`,
      imageUrl: `https://picsum.photos/id/${mediaId}/700/900`,
      videoUrl:
        mediaType !== 'image'
          ? HERO_VIDEOS[globalIndex % HERO_VIDEOS.length]
          : undefined,
      mediaType,
      category: creator.category,
      aspect: ASPECTS[i % ASPECTS.length]!,
      locked: i % 5 === 0,
      price: i % 5 === 0 ? [99, 149, 199][i % 3]! : null,
    }
  })
}

export function getHomeFeedPosts(followingIds: string[]) {
  const followingSet = new Set(followingIds)
  const ranked = [...feedPosts].sort((a, b) => {
    const score = (post: FeedPost) => {
      const creator = feedCreatorsById[post.creatorId]
      let value = 0
      if (creator?.isSubscribed) value += 30
      if (followingSet.has(post.creatorId) || creator?.isFollowing) value += 20
      if (post.source === 'trending') value += 5
      if (!post.locked) value += 8
      return value
    }
    return score(b) - score(a)
  })
  return ranked.slice(0, 24)
}

/** Naturally interleaved subscribed / following / recommended posts for infinite scroll. */
export function buildHomeFeedPage(page: number, pageSize = 6): FeedPost[] {
  const subscribed = feedPosts.filter((p) => p.source === 'subscribed')
  const following = feedPosts.filter((p) => p.source === 'following')
  const recommended = feedPosts.filter((p) => p.source === 'trending')

  const buckets = [subscribed, following, recommended]
  const pattern = [0, 1, 2, 0, 1, 2] as const
  const result: FeedPost[] = []

  for (let i = 0; i < pageSize; i++) {
    const globalIndex = page * pageSize + i
    const bucketIndex = pattern[i % pattern.length]!
    const bucket = buckets[bucketIndex]!
    const fallback = feedPosts
    const pool = bucket.length > 0 ? bucket : fallback
    const base = pool[globalIndex % pool.length]!
    const mediaId = 410 + ((globalIndex * 13) % 180)
    const type: FeedPostType =
      globalIndex % 5 === 2 ? 'video' : globalIndex % 5 === 4 ? 'reel' : 'image'
    const locked = globalIndex % 4 === 3
    const lockKind: FeedLockKind | null = locked
      ? globalIndex % 8 === 3
        ? 'subscribers'
        : 'ppv'
      : null

    result.push({
      ...base,
      id: `home-${page}-${i}-${base.id}`,
      mediaUrl: `https://picsum.photos/id/${mediaId}/900/1100`,
      mediaUrls:
        type === 'image'
          ? [
              `https://picsum.photos/id/${mediaId}/900/1100`,
              `https://picsum.photos/id/${((mediaId + 17) % 199) + 1}/900/1100`,
              `https://picsum.photos/id/${((mediaId + 29) % 199) + 1}/900/1100`,
            ]
          : undefined,
      thumbnailUrl: `https://picsum.photos/id/${mediaId}/600/750`,
      blurredThumbnailUrl: `https://picsum.photos/id/${mediaId}/40/50`,
      videoUrl: type !== 'image' ? HERO_VIDEOS[globalIndex % HERO_VIDEOS.length] : undefined,
      likes: base.likes + globalIndex * 17,
      comments: base.comments + (globalIndex % 9),
      createdAt: new Date(Date.now() - globalIndex * 54e5).toISOString(),
      source: (['subscribed', 'following', 'trending'] as const)[bucketIndex]!,
      locked,
      lockKind,
      price: locked ? 99 : null,
      type,
      hashtags: HASHTAG_SETS[globalIndex % HASHTAG_SETS.length],
      caption:
        CAPTIONS[(globalIndex + bucketIndex) % CAPTIONS.length] ?? base.caption,
    })
  }

  return result
}

export function formatFeedTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.max(1, Math.floor(diff / 60000))
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

export function getStoryCreators(followingIds: string[]) {
  return feedCreators.filter((c) => followingIds.includes(c.id) && c.hasStory)
}

export function getSuggestedCreators(followingIds: string[], limit = 8) {
  return feedCreators
    .filter((c) => !followingIds.includes(c.id))
    .sort((a, b) => b.followers - a.followers)
    .slice(0, limit)
}
