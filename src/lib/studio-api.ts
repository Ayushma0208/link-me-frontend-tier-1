import { api } from '@/lib/api'
import type {
  ContentStatus,
  ContentVisibility,
  PostMediaType,
  StudioPost,
} from '@/data/creator-studio'

export interface CreatorUserDto {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  isVerified: boolean
}

export interface CreatorAnalyticsDto {
  period: string
  views: string
  reach: string
  profileVisits: string
  followersGained: number
  newSubscribers: number
  revenue: string
  coffeeRevenue: string
  ppvRevenue: string
  subscriptionRevenue: string
  engagementRate: string
}

export interface CreatorEarningsBreakdown {
  currency: string
  voiceCalls: string
  videoCalls: string
  live: string
  messages: string
  exclusives: string
  coffee: string
}

export interface CreatorChartPoint {
  label: string
  value: number
}

export interface CreatorEarningsCharts {
  weekRevenue: CreatorChartPoint[]
  monthSubscribers: CreatorChartPoint[]
}

export interface CreatorEarningsResponse {
  earnings: CreatorEarningsBreakdown
  charts?: CreatorEarningsCharts
}

export interface CreatorDashboardProfile {
  id: string
  bio: string
  category: string | null
  location: string | null
  website: string | null
  coverImageUrl: string | null
  coverVideoUrl: string | null
  customLinkLabel: string | null
  customLinkUrl: string | null
  bookingUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  isAcceptingSubs: boolean
  coffee: {
    enabled: boolean
    buttonText: string
    thankYouMessage: string | null
  }
  followerCount: number
  subscriberCount: number
  postCount: number
  user: CreatorUserDto
  analytics: CreatorAnalyticsDto | null
  plans: Array<{
    id: string
    name: string
    price: string
    currency: string
    isActive: boolean
    isFeatured: boolean
  }>
}

export interface PostMediaDto {
  id: string
  type: string
  storageKey: string | null
  url: string | null
  thumbnailKey: string | null
  mimeType: string | null
  sortOrder: number
}

export interface ApiPost {
  id: string
  type: string
  status: string
  visibility: string
  visibilityLabel: string
  title: string | null
  caption: string | null
  price: string | null
  currency: string
  likeCount: number
  commentCount: number
  viewCount: number
  publishedAt: string | null
  scheduledAt: string | null
  createdAt: string
  media: PostMediaDto[]
}

export async function ensureCreatorProfile() {
  return api<{ profile: CreatorDashboardProfile }>('/creators/me', {
    method: 'POST',
  })
}

export async function fetchCreatorDashboard() {
  try {
    return await api<{ profile: CreatorDashboardProfile }>('/creators/me')
  } catch {
    await ensureCreatorProfile()
    return api<{ profile: CreatorDashboardProfile }>('/creators/me')
  }
}

export async function fetchCreatorEarnings() {
  return api<CreatorEarningsResponse>('/creators/me/earnings')
}

export async function fetchMyPosts(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  const q = new URLSearchParams()
  q.set('page', String(params?.page ?? 1))
  q.set('limit', String(params?.limit ?? 50))
  if (params?.status) q.set('status', params.status)
  return api<ApiPost[]>(`/posts/me?${q.toString()}`)
}

export async function deletePost(id: string) {
  await api(`/posts/${id}`, { method: 'DELETE' })
}

export function mapVisibilityToApi(
  visibility: ContentVisibility
): 'FREE' | 'SUBSCRIBERS' | 'PAY_PER_VIEW' {
  if (visibility === 'subscribers') return 'SUBSCRIBERS'
  if (visibility === 'ppv') return 'PAY_PER_VIEW'
  return 'FREE'
}

export function mapMediaTypeToApi(
  type: PostMediaType
): 'IMAGE' | 'VIDEO' | 'REEL' | 'CAROUSEL' {
  switch (type) {
    case 'video':
      return 'VIDEO'
    case 'reel':
      return 'REEL'
    case 'carousel':
      return 'CAROUSEL'
    default:
      return 'IMAGE'
  }
}

function mapTypeFromApi(type: string): PostMediaType {
  const t = type.toUpperCase()
  if (t === 'VIDEO') return 'video'
  if (t === 'REEL') return 'reel'
  if (t === 'CAROUSEL') return 'carousel'
  return 'image'
}

function mapVisibilityFromApi(visibility: string, label?: string): ContentVisibility {
  const v = (label || visibility).toUpperCase()
  if (v === 'SUBSCRIBERS') return 'subscribers'
  if (v === 'PPV' || v === 'PAY_PER_VIEW') return 'ppv'
  return 'public'
}

function mapStatusFromApi(status: string): ContentStatus {
  const s = status.toUpperCase()
  if (s === 'DRAFT') return 'draft'
  if (s === 'SCHEDULED') return 'scheduled'
  return 'published'
}

export function mapApiPostToStudio(post: ApiPost): StudioPost {
  const thumb =
    post.media.find((m) => m.url)?.url ||
    post.media.find((m) => m.thumbnailKey)?.url ||
    'https://picsum.photos/seed/empty/600/600'

  return {
    id: post.id,
    title: post.title || post.caption?.slice(0, 60) || 'Untitled post',
    caption: post.caption ?? undefined,
    type: mapTypeFromApi(post.type),
    visibility: mapVisibilityFromApi(post.visibility, post.visibilityLabel),
    status: mapStatusFromApi(post.status),
    thumbnail: thumb,
    price: post.price ? Number(post.price) : undefined,
    likes: post.likeCount,
    views: post.viewCount,
    createdAt: (post.publishedAt || post.createdAt).slice(0, 10),
    scheduledFor: post.scheduledAt ?? undefined,
  }
}

export function emptyWeekSeries() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => ({
    label,
    value: 0,
  }))
}

export function emptyMonthSeries() {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((label) => ({
    label,
    value: 0,
  }))
}

export function parseMoney(value: string | null | undefined): number {
  if (!value) return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function parseCount(value: string | null | undefined): number {
  if (!value) return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export interface LiveHeatmapSession {
  id: string
  title: string
  startedAt: string | null
  endedAt: string | null
  currency: string
  peakViewers: number
  totalGiftRevenue: number
  giftCount: number
  hasViewerSamples: boolean
}

export interface LiveHeatmapResponse {
  sessions: LiveHeatmapSession[]
  selectedLiveId: string | null
  series: {
    labels: string[]
    viewers: (number | null)[]
    giftRevenue: number[]
  } | null
}

export interface OptimalTimesResponse {
  recommendation: string | null
  window: {
    dayOfWeek: number
    startHour: number
    endHour: number
    timezone: string
  } | null
  grid: number[][]
  sampleSize: number
  timezone: string
}

export interface LiveInsightsResponse {
  live: {
    id: string
    title: string
    status: string
    startedAt: string | null
    endedAt: string | null
    currency: string
  }
  summary: {
    durationSeconds: number
    peakViewers: number
    totalGiftRevenue: number
    totalGiftCount: number
    subsDuringStream: number
    hasViewerSamples: boolean
  }
  buckets: Array<{
    minuteAt: string
    viewers: number | null
    giftRevenue: number
    giftCount: number
    newSubs: number
  }>
  markers: Array<{
    type: 'viewer_drop' | 'sub_spike'
    minuteAt: string
    label: string
  }>
  streamStartAt: string
}

export function fetchLiveHeatmap(liveId?: string) {
  const q = liveId ? `?liveId=${encodeURIComponent(liveId)}` : ''
  return api<LiveHeatmapResponse>(`/creators/me/analytics/live-heatmap${q}`)
}

export function fetchOptimalTimes() {
  return api<OptimalTimesResponse>('/creators/me/analytics/optimal-times')
}

export function fetchLiveInsights(liveId: string) {
  return api<LiveInsightsResponse>(`/creators/me/live/${liveId}/insights`)
}

/** Downsample series for StudioLineChart label density. */
export function downsampleSeries<T>(items: T[], maxPoints = 24): T[] {
  if (items.length <= maxPoints) return items
  const step = Math.ceil(items.length / maxPoints)
  const out: T[] = []
  for (let i = 0; i < items.length; i += step) out.push(items[i]!)
  const last = items[items.length - 1]!
  if (out[out.length - 1] !== last) out.push(last)
  return out
}
