export type UserRole = 'admin' | 'creator' | 'user'

export type PostType = 'image' | 'video' | 'reel'
export type SubscriptionType = 'image' | 'video' | 'full'
export type WalletTxType = 'credit' | 'debit'
export type WalletReferenceType =
  | 'topup'
  | 'chat'
  | 'call'
  | 'tip'
  | 'subscription'
  | 'post_subscription'
export type CallStatus = 'pending' | 'active' | 'ended' | 'cancelled'
export type TipStatus = 'pending' | 'completed' | 'failed'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending'
export type VideoMaskStyle =
  | 'creative'
  | 'splash-water'
  | 'text-overlay'
  | 'hexagon'
  | 'hexagon-two'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  username: string
  role: UserRole
  avatar?: string | null
  walletBalance: number
}

export interface SocialLinkDto {
  id: string
  platform: string
  url: string
  icon: string
}

export interface HighlightDto {
  id: string
  title: string
  thumbnail: string | null
  items: HighlightItemDto[]
}

export interface HighlightItemDto {
  id: string
  storyId: string | null
  postId: string | null
  mediaUrl: string
  type: 'story' | 'image' | 'video'
}

export interface StoryDto {
  id: string
  mediaUrl: string
  thumbnailUrl: string | null
  type: PostType
  expiresAt: string
  createdAt: string
}

export interface PostDto {
  id: string
  type: PostType
  title: string
  mediaUrl: string | null
  thumbnailUrl: string | null
  blurredThumbnailUrl: string | null
  sortOrder: number
  locked: boolean
  price: number | null
}

export interface SubscriptionPlanDto {
  id: string
  name: string
  price: number
  duration: string
  type: SubscriptionType
  features: string[]
}

export interface CreatorProfileDto {
  id: string
  userId: string
  name: string
  username: string
  bio: string
  avatar: string | null
  coverVideo: string | null
  videoMaskStyle: VideoMaskStyle
  verified: boolean
  followers: number
  socialLinks: SocialLinkDto[]
  highlights: HighlightDto[]
  subscriptionPlans: SubscriptionPlanDto[]
  stories: StoryDto[]
  posts: PostDto[]
  coffeeUnitPrice: number
  chatPricePerMessage: number
  callPricePerMinute: number
  freePostCount: number
}

export interface WalletTransactionDto {
  id: string
  type: WalletTxType
  amount: number
  description: string
  referenceType: WalletReferenceType
  createdAt: string
}

export interface MessageDto {
  id: string
  conversationId: string
  senderId: string
  content: string
  amountCharged: number
  createdAt: string
}

export interface ConversationDto {
  id: string
  creatorId: string
  userId: string
  creatorName: string
  userName: string
  lastMessage?: MessageDto
  updatedAt: string
}

export interface CallSessionDto {
  id: string
  creatorId: string
  userId: string
  status: CallStatus
  agoraChannel: string
  pricePerMinute: number
  totalCharged: number
  startedAt: string | null
  endedAt: string | null
}

export interface PlatformStatsDto {
  totalCreators: number
  totalUsers: number
  totalRevenue: number
  activeSubscriptions: number
}
