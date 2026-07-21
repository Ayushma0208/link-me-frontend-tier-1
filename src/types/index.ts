export type UserRole = 'admin' | 'influencer' | 'user'

export interface User {
  id: string
  name: string
  username: string
  email: string
  role: UserRole
  avatar?: string
  verified?: boolean
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  type: 'image' | 'video' | 'full'
}

export interface InfluencerProfile {
  id: string
  userId: string
  name: string
  username: string
  bio: string
  avatar: string
  coverVideo?: string
  videoMaskStyle: VideoMaskStyle
  verified: boolean
  followers: number
  socialLinks: SocialLink[]
  highlights: Highlight[]
  subscriptionPlans: SubscriptionPlan[]
  customDomain?: string
  subdomain?: string
}

export type VideoMaskStyle =
  | 'creative'
  | 'splash-water'
  | 'text-overlay'
  | 'hexagon'
  | 'hexagon-two'

export interface Highlight {
  id: string
  title: string
  thumbnail: string
  type: 'story' | 'image' | 'video'
}

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  date: string
}

export interface ContentItem {
  id: string
  type: 'image' | 'video' | 'voice' | 'chat'
  title: string
  price: number
  locked: boolean
  thumbnail?: string
}

export interface PlatformStats {
  totalInfluencers: number
  totalUsers: number
  totalRevenue: number
  activeSubscriptions: number
}
