import type { ChatPlan } from '@/lib/chat-plans'

export type AdminCreator = {
  id: string
  userId: string
  bio: string
  category: string | null
  coverImageUrl: string | null
  isVerified: boolean
  isAcceptingSubs: boolean
  isCoffeeEnabled: boolean
  coffeeButtonText: string
  chatPricePerMessage: string | null
  voiceCallPrice: string | null
  videoCallPrice: string | null
  pricingCurrency: string
  followerCount: number
  subscriberCount: number
  postCount: number
  createdAt: string
  chatPlans?: ChatPlan[]
  user: {
    id: string
    email: string
    username: string
    displayName: string
    avatarUrl: string | null
    role: string
    status: string
  }
  monthlyPlan: {
    id: string
    name: string
    price: string
    currency: string
    isActive: boolean
  } | null
}

export type AdminRevenue = {
  creatorProfileId: string
  currency: string
  subscriptionRevenue: string
  exclusiveRevenue: string
  coffeeRevenue: string
  liveRevenue: string
  messageRevenue: string
  voiceCallRevenue: string
  videoCallRevenue: string
  totalRevenue: string
}

export type AdminPlatformStats = {
  totalCreators: number
  totalAiCreators: number
  totalHumanCreators: number
  totalUsers: number
  totalRevenue: number
  activeSubscriptions: number
}

export type AdminFanUser = {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl: string | null
  status: string
  createdAt: string
  activeSubscriptionCount: number
}

export type AdminUserDetail = {
  user: {
    id: string
    email: string
    username: string
    displayName: string
    avatarUrl: string | null
    status: string
    createdAt: string
  }
  subscriptions: Array<{
    id: string
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
    plan: {
      id: string
      name: string
      price: string
      currency: string
      interval: string
    }
    creator: {
      id: string
      username: string
      displayName: string
      avatarUrl: string | null
      email: string
      kind: 'ai' | 'human'
    }
  }>
}

export type AdminCreatorSubscriber = {
  id: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  user: {
    id: string
    username: string
    displayName: string
    email: string
    avatarUrl: string | null
  }
  plan: {
    id: string
    name: string
    price: string
    currency: string
    interval: string
  }
}

export function isAiCreatorEmail(email: string | null | undefined): boolean {
  return Boolean(email?.toLowerCase().endsWith('@ai.creators.local'))
}
