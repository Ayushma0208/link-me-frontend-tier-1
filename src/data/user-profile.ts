import { DEMO_FOLLOWING_IDS, DEMO_SUBSCRIBED_IDS, feedCreators, feedPosts } from '@/data/user-feed'

export interface UserProfileStats {
  followers: number
  following: number
  subscriptions: number
  purchased: number
  saved: number
  watched: number
}

export interface ProfileMediaItem {
  id: string
  title: string
  imageUrl: string
  subtitle: string
  href: string
  locked?: boolean
}

export interface ProfileCreatorItem {
  id: string
  name: string
  handle: string
  avatar: string
  href: string
  meta: string
}

export const demoUserProfile = {
  name: 'Alex Rivera',
  username: 'alexrivera',
  email: 'alex@email.com',
  bio: 'Discovering creators · collecting exclusives · always scrolling.',
  avatar: 'https://picsum.photos/id/1005/200/200',
  coverImage: 'https://picsum.photos/id/1015/1200/500',
  joinedLabel: 'Joined Mar 2026',
}

export const userProfileStats: UserProfileStats = {
  followers: 128,
  following: DEMO_FOLLOWING_IDS.length + 4,
  subscriptions: DEMO_SUBSCRIBED_IDS.length,
  purchased: 6,
  saved: 14,
  watched: 23,
}

export function getFollowingCreators(): ProfileCreatorItem[] {
  return feedCreators
    .filter((c) => c.isFollowing || DEMO_FOLLOWING_IDS.includes(c.id as (typeof DEMO_FOLLOWING_IDS)[number]))
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      avatar: c.avatar,
      href: `/${c.handle}`,
      meta: c.category,
    }))
}

export function getSubscriptionCreators(): ProfileCreatorItem[] {
  return feedCreators
    .filter((c) => c.isSubscribed)
    .map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      avatar: c.avatar,
      href: `/${c.handle}`,
      meta: `₹${c.monthlyPrice}/mo`,
    }))
}

export function getPurchasedPosts(): ProfileMediaItem[] {
  return feedPosts
    .filter((p) => p.locked || p.source === 'subscribed')
    .slice(0, 8)
    .map((p, i) => {
      const creator = feedCreators.find((c) => c.id === p.creatorId)
      return {
        id: `purchased-${p.id}`,
        title: p.title,
        imageUrl: p.thumbnailUrl,
        subtitle: creator ? `@${creator.handle}` : 'Creator',
        href: creator ? `/${creator.handle}` : '/user/explore',
        locked: false,
      }
    })
}

export function getSavedPosts(): ProfileMediaItem[] {
  return feedPosts.slice(2, 10).map((p) => {
    const creator = feedCreators.find((c) => c.id === p.creatorId)
    return {
      id: `saved-${p.id}`,
      title: p.title,
      imageUrl: p.thumbnailUrl,
      subtitle: creator ? `@${creator.handle}` : 'Saved',
      href: creator ? `/${creator.handle}` : '/user/saved',
    }
  })
}

export function getWatchHistory(): ProfileMediaItem[] {
  return feedPosts.slice(0, 8).map((p, index) => {
    const creator = feedCreators.find((c) => c.id === p.creatorId)
    return {
      id: `watch-${p.id}`,
      title: p.title,
      imageUrl: p.thumbnailUrl,
      subtitle: index === 0 ? 'Watched just now' : `Watched ${index + 1}d ago`,
      href: creator ? `/user/creator/${creator.handle}` : '/user/explore',
    }
  })
}

export const profileSettingsLinks = [
  {
    id: 'account',
    title: 'Account',
    description: 'Username, password, photo',
    href: '/user/settings/account',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Visibility & blocked creators',
    href: '/user/settings',
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Wallet, payments, invoices',
    href: '/user/wallet',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Push, email, and activity alerts',
    href: '/user/notifications',
  },
] as const
