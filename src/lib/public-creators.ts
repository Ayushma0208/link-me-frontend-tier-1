import type { CreatorSocialId } from '@/data/creators'
import type { ExploreCategory, FeedCreator } from '@/data/user-feed'
import { api } from '@/lib/api'

const DEFAULT_AVATAR =
  'https://picsum.photos/id/64/200/200'
const DEFAULT_COVER =
  'https://picsum.photos/id/1015/1600/900'

export interface PublicCreatorProfileApi {
  id: string
  bio: string
  category: string | null
  location: string | null
  coverImageUrl: string | null
  followerCount: number
  subscriberCount: number
  postCount: number
  isVerified: boolean
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
    isVerified: boolean
  }
  pricing: {
    imagePrice: string | null
  }
  coffee: { enabled: boolean }
  plans: Array<{
    price: string
    isActive: boolean
    isFeatured: boolean
  }>
  socialLinks: Array<{ platform: string; isVisible: boolean }>
}

export interface CreatorPostApi {
  id: string
  type: string
  title: string | null
  caption: string | null
  price: string | null
  locked: boolean
  unlockReason?: string | null
  likeCount: number
  media: Array<{
    url: string | null
    thumbnailKey: string | null
    blurredKey: string | null
    type: string
  }>
}

function categoryOf(raw: string | null | undefined): ExploreCategory {
  const value = (raw || 'For You').trim()
  const allowed: ExploreCategory[] = [
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
  return (allowed.find((c) => c.toLowerCase() === value.toLowerCase()) ??
    'Fashion') as ExploreCategory
}

function socialIdsFrom(
  links: PublicCreatorProfileApi['socialLinks']
): CreatorSocialId[] {
  const map: Record<string, CreatorSocialId> = {
    INSTAGRAM: 'instagram',
    TIKTOK: 'tiktok',
    YOUTUBE: 'youtube',
    X: 'x',
    TWITTER: 'x',
    TWITCH: 'twitch',
    SPOTIFY: 'spotify',
  }
  const out: CreatorSocialId[] = []
  for (const link of links) {
    if (!link.isVisible) continue
    const id = map[link.platform.toUpperCase()]
    if (id && !out.includes(id)) out.push(id)
  }
  return out
}

export function mapPublicProfileToFeedCreator(
  profile: PublicCreatorProfileApi
): FeedCreator {
  const plan =
    profile.plans.find((p) => p.isFeatured && p.isActive) ||
    profile.plans.find((p) => p.isActive)
  const handle = profile.user.username.replace(/^@/, '').toLowerCase()

  return {
    id: profile.id,
    name: profile.user.displayName || handle,
    username: `@${handle}`,
    handle,
    avatar: profile.user.avatarUrl || DEFAULT_AVATAR,
    coverImage: profile.coverImageUrl || DEFAULT_COVER,
    bio: profile.bio || 'No bio yet.',
    verified: profile.isVerified || profile.user.isVerified,
    followers: profile.followerCount,
    category: categoryOf(profile.category),
    socialLinks: socialIdsFrom(profile.socialLinks),
    monthlyPrice: plan ? Number(plan.price) || 299 : 299,
    isFollowing: false,
    isSubscribed: false,
    hasStory: false,
    storySeen: false,
  }
}

export async function listPublicCreators(options?: {
  page?: number
  limit?: number
  q?: string
}): Promise<FeedCreator[]> {
  const page = options?.page ?? 1
  const limit = options?.limit ?? 24
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (options?.q?.trim()) params.set('q', options.q.trim())

  const items = await api<PublicCreatorProfileApi[]>(
    `/creators?${params.toString()}`
  )
  return (items ?? []).map(mapPublicProfileToFeedCreator)
}

export async function getPublicCreatorProfile(
  username: string
): Promise<PublicCreatorProfileApi | null> {
  const handle = username.replace(/^@/, '').toLowerCase()
  try {
    const data = await api<{ profile: PublicCreatorProfileApi }>(
      `/creators/${encodeURIComponent(handle)}`
    )
    return data.profile
  } catch {
    return null
  }
}

export async function listCreatorPosts(
  username: string,
  limit = 24
): Promise<CreatorPostApi[]> {
  const handle = username.replace(/^@/, '').toLowerCase()
  try {
    const items = await api<CreatorPostApi[]>(
      `/posts/creator/${encodeURIComponent(handle)}?page=1&limit=${limit}`
    )
    return items ?? []
  } catch {
    return []
  }
}
