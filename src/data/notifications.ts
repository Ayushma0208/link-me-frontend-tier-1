import { feedCreators } from '@/data/user-feed'

export type NotificationType =
  | 'story_uploaded'
  | 'premium_post'
  | 'subscription_expiring'
  | 'creator_live'
  | 'coffee_received'
  | 'like'
  | 'comment'
  | 'follow'
  | 'event'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  createdAt: string
  read: boolean
  href?: string
  creatorId?: string
  actorId?: string
  meta?: string
  amount?: string
  previewUrl?: string
  /** True when a LIVE notification is for an ended session. */
  liveEnded?: boolean
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 36e5).toISOString()
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 864e5).toISOString()
}

const demoCreator = feedCreators[0]

export const notifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'creator_live',
    title: 'Creator live',
    body: `${demoCreator?.name ?? 'Creator'} just went live — join now`,
    createdAt: hoursAgo(0.2),
    read: false,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    meta: 'Just now',
  },
  {
    id: 'n2',
    type: 'story_uploaded',
    title: 'Story uploaded',
    body: `${demoCreator?.name ?? 'Sofia'} posted a new story`,
    createdAt: hoursAgo(0.8),
    read: false,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    previewUrl: demoCreator?.coverImage,
    meta: '48m ago',
  },
  {
    id: 'n3',
    type: 'like',
    title: 'New likes',
    body: `${demoCreator?.name ?? 'Jordan'} and 12 others liked your comment`,
    createdAt: hoursAgo(1.5),
    read: false,
    actorId: demoCreator?.id,
    creatorId: demoCreator?.id,
    href: '/user/profile',
    meta: '1h ago',
  },
  {
    id: 'n4',
    type: 'premium_post',
    title: 'New premium post',
    body: `${demoCreator?.name ?? 'Alex'} dropped exclusive gameplay footage`,
    createdAt: hoursAgo(3),
    read: false,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    previewUrl: demoCreator?.coverImage,
    meta: '3h ago',
  },
  {
    id: 'n5',
    type: 'comment',
    title: 'New comment',
    body: `${demoCreator?.name ?? 'Priya'} replied: “This drop is unreal 🔥”`,
    createdAt: hoursAgo(5),
    read: true,
    actorId: demoCreator?.id,
    creatorId: demoCreator?.id,
    href: '/user/profile',
    meta: '5h ago',
  },
  {
    id: 'n6',
    type: 'coffee_received',
    title: 'Coffee received',
    body: `${demoCreator?.name ?? 'Devon'} sent you a coffee`,
    createdAt: hoursAgo(7),
    read: false,
    actorId: demoCreator?.id,
    creatorId: demoCreator?.id,
    href: '/influencer/coffee',
    amount: '₹99',
    meta: '7h ago',
  },
  {
    id: 'n7',
    type: 'subscription_expiring',
    title: 'Subscription expiring',
    body: `Your plan with ${demoCreator?.name ?? 'Lena'} ends in 3 days`,
    createdAt: hoursAgo(10),
    read: true,
    creatorId: demoCreator?.id,
    href: '/user/subscriptions',
    amount: '₹299',
    meta: '10h ago',
  },
  {
    id: 'n8',
    type: 'follow',
    title: 'New follower',
    body: `${demoCreator?.name ?? 'Marcus'} started following you`,
    createdAt: hoursAgo(14),
    read: true,
    actorId: demoCreator?.id,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    meta: '14h ago',
  },
  {
    id: 'n9',
    type: 'story_uploaded',
    title: 'Story uploaded',
    body: `${demoCreator?.name ?? 'Jordan'} shared a behind-the-scenes story`,
    createdAt: hoursAgo(26),
    read: true,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    previewUrl: demoCreator?.coverImage,
    meta: 'Yesterday',
  },
  {
    id: 'n10',
    type: 'premium_post',
    title: 'New premium post',
    body: `${demoCreator?.name ?? 'Sofia'} published a members-only lookbook`,
    createdAt: hoursAgo(28),
    read: false,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    previewUrl: demoCreator?.coverImage,
    meta: 'Yesterday',
  },
  {
    id: 'n11',
    type: 'like',
    title: 'New likes',
    body: `${demoCreator?.name ?? 'Creator'} liked your reply`,
    createdAt: hoursAgo(32),
    read: true,
    actorId: demoCreator?.id,
    creatorId: demoCreator?.id,
    href: '/user/profile',
    meta: 'Yesterday',
  },
  {
    id: 'n12',
    type: 'creator_live',
    title: 'Creator live',
    body: `${demoCreator?.name ?? 'Alex'} hosted a live Q&A session`,
    createdAt: hoursAgo(36),
    read: true,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    meta: 'Yesterday',
  },
  {
    id: 'n13',
    type: 'comment',
    title: 'New comment',
    body: `${demoCreator?.name ?? 'Lena'} commented on a post you saved`,
    createdAt: daysAgo(3),
    read: true,
    actorId: demoCreator?.id,
    creatorId: demoCreator?.id,
    href: '/user/favorites',
    meta: '3d ago',
  },
  {
    id: 'n14',
    type: 'follow',
    title: 'New followers',
    body: `${demoCreator?.name ?? 'Priya'} and 4 others followed you`,
    createdAt: daysAgo(4),
    read: true,
    actorId: demoCreator?.id,
    creatorId: demoCreator?.id,
    href: '/user/profile',
    meta: '4d ago',
  },
  {
    id: 'n15',
    type: 'coffee_received',
    title: 'Coffee received',
    body: `${demoCreator?.name ?? 'Jordan'} tipped you a large coffee`,
    createdAt: daysAgo(5),
    read: true,
    actorId: demoCreator?.id,
    creatorId: demoCreator?.id,
    href: '/influencer/coffee',
    amount: '₹249',
    meta: '5d ago',
  },
  {
    id: 'n16',
    type: 'subscription_expiring',
    title: 'Subscription expiring',
    body: `Renew ${demoCreator?.name ?? 'Marcus'}’s membership before it lapses`,
    createdAt: daysAgo(7),
    read: true,
    creatorId: demoCreator?.id,
    href: '/user/subscriptions',
    amount: '₹499',
    meta: '7d ago',
  },
  {
    id: 'n17',
    type: 'premium_post',
    title: 'New premium post',
    body: `${demoCreator?.name ?? 'Creator'} shared a subscriber-only training plan`,
    createdAt: daysAgo(9),
    read: true,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    previewUrl: demoCreator?.coverImage,
    meta: '9d ago',
  },
  {
    id: 'n18',
    type: 'story_uploaded',
    title: 'Story uploaded',
    body: `${demoCreator?.name ?? 'Devon'} posted morning studio clips`,
    createdAt: daysAgo(11),
    read: true,
    creatorId: demoCreator?.id,
    href: demoCreator ? `/${demoCreator.handle}` : '/user/explore',
    previewUrl: demoCreator?.coverImage,
    meta: '11d ago',
  },
]

export type NotificationGroupKey = 'today' | 'yesterday' | 'earlier'

export interface NotificationGroup {
  key: NotificationGroupKey
  label: string
  items: AppNotification[]
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function groupNotifications(
  items: AppNotification[] = notifications
): NotificationGroup[] {
  const now = new Date()
  const todayStart = startOfDay(now)
  const yesterdayStart = todayStart - 864e5

  const buckets: Record<NotificationGroupKey, AppNotification[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  }

  for (const item of items) {
    const ts = new Date(item.createdAt).getTime()
    if (ts >= todayStart) buckets.today.push(item)
    else if (ts >= yesterdayStart) buckets.yesterday.push(item)
    else buckets.earlier.push(item)
  }

  const order: Array<{ key: NotificationGroupKey; label: string }> = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'earlier', label: 'Earlier' },
  ]

  return order
    .map(({ key, label }) => ({
      key,
      label,
      items: buckets[key].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .filter((group) => group.items.length > 0)
}

export const notificationTypeFilters: Array<{
  id: NotificationType | 'all'
  label: string
}> = [
  { id: 'all', label: 'All' },
  { id: 'story_uploaded', label: 'Stories' },
  { id: 'premium_post', label: 'Posts' },
  { id: 'creator_live', label: 'Live' },
  { id: 'event', label: 'Events' },
  { id: 'subscription_expiring', label: 'Subscriptions' },
  { id: 'coffee_received', label: 'Coffee' },
  { id: 'like', label: 'Likes' },
  { id: 'comment', label: 'Comments' },
  { id: 'follow', label: 'Follows' },
]
