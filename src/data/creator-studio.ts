export type ContentVisibility = 'public' | 'subscribers' | 'ppv'
export type PostMediaType = 'image' | 'video' | 'reel' | 'carousel'
export type ContentStatus = 'published' | 'draft' | 'scheduled'

export interface StudioPost {
  id: string
  title: string
  caption?: string
  type: PostMediaType
  visibility: ContentVisibility
  status: ContentStatus
  thumbnail: string
  price?: number
  likes: number
  views: number
  createdAt: string
  scheduledFor?: string
}

export interface StudioStory {
  id: string
  mediaUrl: string
  type: 'image' | 'video'
  views: number
  expiresAt: string
  createdAt: string
}

export interface StudioHighlight {
  id: string
  title: string
  cover: string
  storyIds: string[]
  /** Convenience count — prefer storyIds.length when editing. */
  storyCount: number
}

export interface SubscriptionConfig {
  monthlyPrice: number
  payPerPostPrice: number
  defaultVisibility: ContentVisibility
  enabled: boolean
}

export interface CreatorPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  benefits: string[]
  enabled: boolean
  featured?: boolean
  badge?: string
  accent: 'violet' | 'amber' | 'sky' | 'rose'
}

export interface CoffeeConfig {
  enabled: boolean
  defaultPrice: number
  allowCustomAmount: boolean
  buttonText: string
  suggestedAmounts: number[]
  thankYouMessage: string
  goalTitle: string
  goalTarget: number
  goalRaised: number
}

export interface CoffeeSupporter {
  id: string
  name: string
  avatar?: string
  amount: number
  message: string
  createdAt: string
}

export interface CoffeeMetrics {
  totalDonations: number
  monthlyDonations: number
  averageDonation: number
  supporterCount: number
  totalChange: number
  monthlyChange: number
}

export interface StudioAnalytics {
  followers: number
  subscribers: number
  revenue: number
  coffeeSupport: number
  postSales: number
  storyViews: number
  profileViews: number
  reelViews: number
  totalViews: number
  reach: number
  postEngagement: number
  followersChange: number
  subscribersChange: number
  revenueChange: number
  viewsChange: number
  reachChange: number
  engagementChange: number
  coffeeChange: number
}

export interface EarningsTransaction {
  id: string
  label: string
  type: 'subscription' | 'ppv' | 'coffee' | 'payout'
  amount: number
  date: string
}

export interface RevenueTopPost {
  id: string
  title: string
  thumbnail: string
  type: 'image' | 'video' | 'reel' | 'carousel'
  revenue: number
  sales: number
}

export interface RevenueTopSubscriber {
  id: string
  name: string
  handle: string
  avatar: string
  plan: SubscriberPlan
  totalPaid: number
}

export type PayoutStatus = 'scheduled' | 'processing' | 'paid' | 'on_hold'

export interface PayoutInfo {
  status: PayoutStatus
  availableBalance: number
  pendingBalance: number
  lastPayoutAmount: number
  lastPayoutDate: string
  upcomingAmount: number
  upcomingDate: string
  method: string
  accountLast4: string
}

export interface RevenueMetrics {
  today: number
  todayChange: number
  monthly: number
  monthlyChange: number
  total: number
  totalChange: number
  coffee: number
  lockedPosts: number
  subscriptions: number
}

export type SubscriberPlan = 'Monthly' | 'Yearly' | 'VIP' | 'Gold'
export type SubscriberStatus = 'active' | 'past_due' | 'cancelled'

export interface SubscriberPayment {
  id: string
  date: string
  amount: number
  method: string
  status: 'paid' | 'failed' | 'refunded'
}

export interface SubscriberHistoryItem {
  id: string
  label: string
  date: string
  amount?: number
}

export interface SubscriberMessage {
  id: string
  from: 'fan' | 'creator'
  body: string
  date: string
}

export interface StudioSubscriber {
  id: string
  name: string
  handle: string
  email: string
  avatar: string
  plan: SubscriberPlan
  renewalDate: string
  amount: number
  totalPaid: number
  status: SubscriberStatus
  joinedAt: string
  history: SubscriberHistoryItem[]
  payments: SubscriberPayment[]
  messages: SubscriberMessage[]
}

export interface StudioPurchase {
  id: string
  buyer: string
  item: string
  amount: number
  date: string
}

export interface StudioComment {
  id: string
  author: string
  avatar: string
  body: string
  postTitle: string
  createdAt: string
}

export interface CreatorStudioProfile {
  displayName: string
  username: string
  bio: string
  website: string
  avatar: string
  cover: string
  socialLinks: { id: string; platform: string; url: string }[]
}

export const studioAnalytics: StudioAnalytics = {
  followers: 128_400,
  subscribers: 3_842,
  revenue: 184_250,
  coffeeSupport: 24_680,
  postSales: 41_920,
  storyViews: 892_000,
  profileViews: 1_240_000,
  reelViews: 2_180_000,
  totalViews: 4_312_000,
  reach: 2_860_000,
  postEngagement: 8.6,
  followersChange: 12.4,
  subscribersChange: 8.1,
  revenueChange: 22.6,
  viewsChange: 15.2,
  reachChange: 11.8,
  engagementChange: 3.4,
  coffeeChange: 18.4,
}

export const studioPosts: StudioPost[] = [
  {
    id: 'p1',
    title: 'Paris lookbook — golden hour',
    caption: 'Golden hour frames from the Paris set. #fashion #travel',
    type: 'image',
    visibility: 'public',
    status: 'published',
    thumbnail:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    likes: 4200,
    views: 28_100,
    createdAt: '2026-07-08',
  },
  {
    id: 'p2',
    title: 'Subscriber-only studio session',
    caption: 'Full cut for members only.',
    type: 'video',
    visibility: 'subscribers',
    status: 'published',
    thumbnail:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
    likes: 1800,
    views: 9_400,
    createdAt: '2026-07-06',
  },
  {
    id: 'p3',
    title: 'Behind the campaign reel',
    caption: 'Unlock the uncut reel.',
    type: 'reel',
    visibility: 'ppv',
    status: 'published',
    price: 99,
    thumbnail:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    likes: 960,
    views: 5_200,
    createdAt: '2026-07-04',
  },
  {
    id: 'p4',
    title: 'Morning ritual',
    type: 'image',
    visibility: 'subscribers',
    status: 'published',
    thumbnail:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    likes: 2100,
    views: 11_800,
    createdAt: '2026-07-02',
  },
  {
    id: 'p5',
    title: 'City lights BTS',
    type: 'video',
    visibility: 'public',
    status: 'published',
    thumbnail:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
    likes: 5300,
    views: 44_200,
    createdAt: '2026-06-28',
  },
  {
    id: 'p6',
    title: 'Exclusive night edit',
    type: 'reel',
    visibility: 'ppv',
    status: 'published',
    price: 149,
    thumbnail:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    likes: 720,
    views: 3_100,
    createdAt: '2026-06-25',
  },
  {
    id: 'p7',
    title: 'Carousel — summer moods',
    caption: 'Slide through the season.',
    type: 'carousel',
    visibility: 'public',
    status: 'published',
    thumbnail:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
    likes: 3100,
    views: 19_400,
    createdAt: '2026-07-09',
  },
  {
    id: 'p8',
    title: 'Draft — runway notes',
    caption: 'WIP captions and selects.',
    type: 'image',
    visibility: 'public',
    status: 'draft',
    thumbnail:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
    likes: 0,
    views: 0,
    createdAt: '2026-07-11',
  },
  {
    id: 'p9',
    title: 'Draft — VIP teaser cut',
    type: 'video',
    visibility: 'subscribers',
    status: 'draft',
    thumbnail:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    likes: 0,
    views: 0,
    createdAt: '2026-07-10',
  },
  {
    id: 'p10',
    title: 'Scheduled — weekend drop',
    caption: 'Goes live Saturday evening.',
    type: 'reel',
    visibility: 'ppv',
    status: 'scheduled',
    price: 79,
    thumbnail:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    likes: 0,
    views: 0,
    createdAt: '2026-07-11',
    scheduledFor: '2026-07-18T18:00:00Z',
  },
  {
    id: 'p11',
    title: 'Scheduled — members Q&A promo',
    type: 'image',
    visibility: 'subscribers',
    status: 'scheduled',
    thumbnail:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    likes: 0,
    views: 0,
    createdAt: '2026-07-10',
    scheduledFor: '2026-07-15T12:00:00Z',
  },
  {
    id: 'p12',
    title: 'Locked lookbook Vol. 2',
    type: 'carousel',
    visibility: 'subscribers',
    status: 'published',
    thumbnail:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    likes: 1400,
    views: 7_800,
    createdAt: '2026-07-01',
  },
]


function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 36e5).toISOString()
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 36e5).toISOString()
}

export const studioStories: StudioStory[] = [
  {
    id: 's1',
    mediaUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=720&q=80',
    type: 'image',
    views: 12_400,
    expiresAt: hoursFromNow(18),
    createdAt: hoursAgo(6),
  },
  {
    id: 's2',
    mediaUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=720&q=80',
    type: 'video',
    views: 8_900,
    expiresAt: hoursFromNow(12),
    createdAt: hoursAgo(10),
  },
  {
    id: 's3',
    mediaUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=720&q=80',
    type: 'image',
    views: 15_200,
    expiresAt: hoursFromNow(4),
    createdAt: hoursAgo(20),
  },
  {
    id: 's4',
    mediaUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=720&q=80',
    type: 'image',
    views: 6_100,
    expiresAt: hoursFromNow(22),
    createdAt: hoursAgo(2),
  },
  {
    id: 's5',
    mediaUrl:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=720&q=80',
    type: 'video',
    views: 21_800,
    expiresAt: hoursAgo(8),
    createdAt: hoursAgo(32),
  },
  {
    id: 's6',
    mediaUrl:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=720&q=80',
    type: 'image',
    views: 9_400,
    expiresAt: hoursAgo(20),
    createdAt: hoursAgo(44),
  },
  {
    id: 's7',
    mediaUrl:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=720&q=80',
    type: 'image',
    views: 4_200,
    expiresAt: hoursAgo(30),
    createdAt: hoursAgo(54),
  },
]

export const studioHighlights: StudioHighlight[] = [
  {
    id: 'h1',
    title: 'Travel',
    cover:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80',
    storyIds: ['s5', 's6'],
    storyCount: 2,
  },
  {
    id: 'h2',
    title: 'Looks',
    cover:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80',
    storyIds: ['s1', 's3'],
    storyCount: 2,
  },
  {
    id: 'h3',
    title: 'BTS',
    cover:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=300&q=80',
    storyIds: ['s2', 's7'],
    storyCount: 2,
  },
  {
    id: 'h4',
    title: 'Events',
    cover:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80',
    storyIds: ['s4'],
    storyCount: 1,
  },
]

export function isStoryActive(story: StudioStory, now = Date.now()) {
  return new Date(story.expiresAt).getTime() > now
}

export function hoursRemaining(story: StudioStory, now = Date.now()) {
  return Math.max(
    0,
    Math.round((new Date(story.expiresAt).getTime() - now) / 36e5)
  )
}

export const defaultSubscriptionConfig: SubscriptionConfig = {
  monthlyPrice: 299,
  payPerPostPrice: 49,
  defaultVisibility: 'subscribers',
  enabled: true,
}

export const creatorPlans: CreatorPlan[] = [
  {
    id: 'plan-monthly',
    name: 'Monthly',
    description: 'Flexible access — cancel anytime. Perfect for new fans.',
    monthlyPrice: 299,
    yearlyPrice: 2_999,
    benefits: [
      'All subscriber posts',
      'Premium stories & highlights',
      'Community chat access',
      'Cancel anytime',
    ],
    enabled: true,
    accent: 'sky',
  },
  {
    id: 'plan-yearly',
    name: 'Yearly',
    description: 'Best value for loyal supporters — two months free.',
    monthlyPrice: 249,
    yearlyPrice: 2_988,
    benefits: [
      'Everything in Monthly',
      '2 months free vs monthly',
      'Yearly member badge',
      'Early access to drops',
    ],
    enabled: true,
    featured: true,
    badge: 'Best value',
    accent: 'violet',
  },
  {
    id: 'plan-vip',
    name: 'VIP',
    description: 'Closest access — live hangouts and direct replies.',
    monthlyPrice: 799,
    yearlyPrice: 7_999,
    benefits: [
      'Everything in Yearly',
      'Monthly live VIP session',
      'Priority DMs',
      'Name in credits',
    ],
    enabled: true,
    badge: 'Popular',
    accent: 'rose',
  },
  {
    id: 'plan-gold',
    name: 'Gold',
    description: 'Ultimate membership with custom perks and merch.',
    monthlyPrice: 1_499,
    yearlyPrice: 14_999,
    benefits: [
      'Everything in VIP',
      'Quarterly merch drop',
      '1:1 video call / year',
      'Custom request lane',
    ],
    enabled: false,
    badge: 'Coming soon',
    accent: 'amber',
  },
]

export const defaultCoffeeConfig: CoffeeConfig = {
  enabled: true,
  defaultPrice: 99,
  allowCustomAmount: true,
  buttonText: 'Buy me a coffee',
  suggestedAmounts: [99, 199, 499],
  thankYouMessage: 'Thank you for the coffee — you just fueled the next drop ☕',
  goalTitle: 'New lens fund',
  goalTarget: 50_000,
  goalRaised: 32_400,
}

export const coffeeMetrics: CoffeeMetrics = {
  totalDonations: 24_680,
  monthlyDonations: 6_420,
  averageDonation: 186,
  supporterCount: 132,
  totalChange: 18.4,
  monthlyChange: 24.1,
}

export const coffeeSupporters: CoffeeSupporter[] = [
  {
    id: 'c1',
    name: 'Aarav Mehta',
    avatar: 'https://picsum.photos/id/177/100/100',
    amount: 199,
    message: 'Love your travel series — keep going!',
    createdAt: 'Today · 1:42 PM',
  },
  {
    id: 'c2',
    name: 'Sofia Reyes',
    avatar: 'https://picsum.photos/id/338/100/100',
    amount: 99,
    message: 'Coffee for the queen ☕',
    createdAt: 'Yesterday',
  },
  {
    id: 'c3',
    name: 'Kenji Tanaka',
    avatar: 'https://picsum.photos/id/91/100/100',
    amount: 499,
    message: 'That Paris reel was unreal.',
    createdAt: 'Jul 9',
  },
  {
    id: 'c4',
    name: 'Anonymous',
    amount: 149,
    message: 'Thank you for the exclusive drops.',
    createdAt: 'Jul 8',
  },
  {
    id: 'c5',
    name: 'Priya Nair',
    avatar: 'https://picsum.photos/id/65/100/100',
    amount: 999,
    message: 'For the new lens — can\'t wait to see what you shoot.',
    createdAt: 'Jul 7',
  },
  {
    id: 'c6',
    name: 'Marcus Lee',
    avatar: 'https://picsum.photos/id/201/100/100',
    amount: 299,
    message: 'Your studio sessions are gold.',
    createdAt: 'Jul 6',
  },
  {
    id: 'c7',
    name: 'Lina Ortega',
    avatar: 'https://picsum.photos/id/342/100/100',
    amount: 99,
    message: 'Small tip, big thanks!',
    createdAt: 'Jul 5',
  },
  {
    id: 'c8',
    name: 'Devon Cole',
    avatar: 'https://picsum.photos/id/325/100/100',
    amount: 499,
    message: 'Fuel for the weekend drop.',
    createdAt: 'Jul 4',
  },
]

export const coffeeTopSupporters = [...coffeeSupporters]
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 4)

export const revenueMetrics: RevenueMetrics = {
  today: 8_640,
  todayChange: 14.2,
  monthly: 184_250,
  monthlyChange: 22.6,
  total: 1_248_600,
  totalChange: 18.4,
  coffee: 24_680,
  lockedPosts: 41_920,
  subscriptions: 117_650,
}

export const earningsTransactions: EarningsTransaction[] = [
  {
    id: 't1',
    label: 'VIP renewal — Priya Nair',
    type: 'subscription',
    amount: 999,
    date: 'Today · 2:14 PM',
  },
  {
    id: 't2',
    label: 'Monthly subscriptions batch',
    type: 'subscription',
    amount: 12_480,
    date: 'Today · 11:02 AM',
  },
  {
    id: 't3',
    label: 'PPV — Behind the campaign',
    type: 'ppv',
    amount: 3_920,
    date: 'Yesterday',
  },
  {
    id: 't4',
    label: 'Coffee — Aisha Khan',
    type: 'coffee',
    amount: 499,
    date: 'Yesterday',
  },
  {
    id: 't5',
    label: 'Coffee support batch',
    type: 'coffee',
    amount: 1_140,
    date: 'Jul 10',
  },
  {
    id: 't6',
    label: 'Payout to HDFC ****4821',
    type: 'payout',
    amount: -25_000,
    date: 'Jul 8',
  },
  {
    id: 't7',
    label: 'PPV — Night edit',
    type: 'ppv',
    amount: 2_680,
    date: 'Jul 6',
  },
  {
    id: 't8',
    label: 'Yearly plan — Marcus Lee',
    type: 'subscription',
    amount: 2_999,
    date: 'Jul 5',
  },
]

export const revenueSeries = [
  { label: 'Mon', value: 18 },
  { label: 'Tue', value: 24 },
  { label: 'Wed', value: 21 },
  { label: 'Thu', value: 32 },
  { label: 'Fri', value: 28 },
  { label: 'Sat', value: 41 },
  { label: 'Sun', value: 36 },
]

/** Monthly revenue over time (INR thousands for chart scale). */
export const revenueOverTimeSeries = [
  { label: 'Jan', value: 98 },
  { label: 'Feb', value: 112 },
  { label: 'Mar', value: 128 },
  { label: 'Apr', value: 141 },
  { label: 'May', value: 156 },
  { label: 'Jun', value: 169 },
  { label: 'Jul', value: 184 },
]

export const topRevenuePosts: RevenueTopPost[] = [
  {
    id: 'p2',
    title: 'Subscriber-only studio session',
    thumbnail:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=200&q=80',
    type: 'video',
    revenue: 18_420,
    sales: 62,
  },
  {
    id: 'p3',
    title: 'Behind the campaign reel',
    thumbnail:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80',
    type: 'reel',
    revenue: 12_860,
    sales: 44,
  },
  {
    id: 'p6',
    title: 'Exclusive night edit',
    thumbnail:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=200&q=80',
    type: 'image',
    revenue: 9_140,
    sales: 31,
  },
  {
    id: 'p10',
    title: 'Locked lookbook Vol. 2',
    thumbnail:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&q=80',
    type: 'carousel',
    revenue: 7_680,
    sales: 28,
  },
]

export const topRevenueSubscribers: RevenueTopSubscriber[] = [
  {
    id: 'sub3',
    name: 'Priya Nair',
    handle: 'priyan',
    avatar: 'https://picsum.photos/id/65/100/100',
    plan: 'VIP',
    totalPaid: 12_987,
  },
  {
    id: 'sub2',
    name: 'Marcus Lee',
    handle: 'marcusl',
    avatar: 'https://picsum.photos/id/91/100/100',
    plan: 'Yearly',
    totalPaid: 8_997,
  },
  {
    id: 'sub5',
    name: 'Sofia Reyes',
    handle: 'sofiar',
    avatar: 'https://picsum.photos/id/338/100/100',
    plan: 'Gold',
    totalPaid: 7_490,
  },
  {
    id: 'sub1',
    name: 'Aisha Khan',
    handle: 'aishak',
    avatar: 'https://picsum.photos/id/64/100/100',
    plan: 'Monthly',
    totalPaid: 2_691,
  },
]

export const payoutInfo: PayoutInfo = {
  status: 'scheduled',
  availableBalance: 62_480,
  pendingBalance: 18_240,
  lastPayoutAmount: 25_000,
  lastPayoutDate: 'Jul 8, 2026',
  upcomingAmount: 62_480,
  upcomingDate: 'Fri, Jul 18',
  method: 'Bank transfer',
  accountLast4: '4821',
}

export const followersGrowthSeries = [
  { label: 'Jan', value: 92 },
  { label: 'Feb', value: 98 },
  { label: 'Mar', value: 104 },
  { label: 'Apr', value: 111 },
  { label: 'May', value: 118 },
  { label: 'Jun', value: 124 },
  { label: 'Jul', value: 128 },
]

export const subscriptionsSeries = [
  { label: 'Jan', value: 2.4 },
  { label: 'Feb', value: 2.7 },
  { label: 'Mar', value: 2.9 },
  { label: 'Apr', value: 3.1 },
  { label: 'May', value: 3.4 },
  { label: 'Jun', value: 3.6 },
  { label: 'Jul', value: 3.8 },
]

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly'

export interface AnalyticsSeriesPoint {
  label: string
  views: number
  reach: number
}

export interface AnalyticsBreakdownRow {
  label: string
  value: number
  pct: number
}

export interface AnalyticsTopPost {
  id: string
  title: string
  thumbnail: string
  type: string
  views: number
  engagement: number
}

export interface AnalyticsTopStory {
  id: string
  thumbnail: string
  type: 'image' | 'video'
  views: number
  replies: number
}

export interface AnalyticsTrafficSource {
  id: string
  label: string
  visits: number
  pct: number
  color: string
}

export const analyticsPeriodSeries: Record<
  AnalyticsPeriod,
  AnalyticsSeriesPoint[]
> = {
  daily: [
    { label: 'Mon', views: 48, reach: 31 },
    { label: 'Tue', views: 52, reach: 34 },
    { label: 'Wed', views: 61, reach: 39 },
    { label: 'Thu', views: 58, reach: 37 },
    { label: 'Fri', views: 72, reach: 46 },
    { label: 'Sat', views: 88, reach: 55 },
    { label: 'Sun', views: 79, reach: 51 },
  ],
  weekly: [
    { label: 'W1', views: 312, reach: 198 },
    { label: 'W2', views: 348, reach: 221 },
    { label: 'W3', views: 401, reach: 254 },
    { label: 'W4', views: 386, reach: 248 },
    { label: 'W5', views: 442, reach: 279 },
    { label: 'W6', views: 468, reach: 301 },
  ],
  monthly: [
    { label: 'Jan', views: 980, reach: 620 },
    { label: 'Feb', views: 1_120, reach: 710 },
    { label: 'Mar', views: 1_280, reach: 820 },
    { label: 'Apr', views: 1_410, reach: 890 },
    { label: 'May', views: 1_560, reach: 980 },
    { label: 'Jun', views: 1_690, reach: 1_060 },
    { label: 'Jul', views: 1_840, reach: 1_180 },
  ],
}

export const analyticsTopPosts: AnalyticsTopPost[] = [
  {
    id: 'p5',
    title: 'City lights BTS',
    thumbnail:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=200&q=80',
    type: 'reel',
    views: 44_200,
    engagement: 12.4,
  },
  {
    id: 'p1',
    title: 'Paris lookbook — golden hour',
    thumbnail:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&q=80',
    type: 'image',
    views: 28_100,
    engagement: 9.8,
  },
  {
    id: 'p7',
    title: 'Carousel — summer moods',
    thumbnail:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=200&q=80',
    type: 'carousel',
    views: 19_400,
    engagement: 8.2,
  },
  {
    id: 'p4',
    title: 'Morning ritual',
    thumbnail:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    type: 'image',
    views: 11_800,
    engagement: 7.1,
  },
]

export const analyticsTopStories: AnalyticsTopStory[] = [
  {
    id: 's5',
    thumbnail:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=200&q=80',
    type: 'video',
    views: 21_800,
    replies: 186,
  },
  {
    id: 's3',
    thumbnail:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80',
    type: 'image',
    views: 15_200,
    replies: 124,
  },
  {
    id: 's1',
    thumbnail:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    type: 'image',
    views: 12_400,
    replies: 98,
  },
  {
    id: 's2',
    thumbnail:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    type: 'video',
    views: 8_900,
    replies: 72,
  },
]

export const analyticsAudience = {
  countries: [
    { label: 'India', value: 42_800, pct: 34 },
    { label: 'United States', value: 28_100, pct: 22 },
    { label: 'United Kingdom', value: 14_200, pct: 11 },
    { label: 'UAE', value: 11_600, pct: 9 },
    { label: 'Singapore', value: 8_900, pct: 7 },
  ] satisfies AnalyticsBreakdownRow[],
  age: [
    { label: '13–17', value: 6_400, pct: 5 },
    { label: '18–24', value: 41_200, pct: 32 },
    { label: '25–34', value: 48_600, pct: 38 },
    { label: '35–44', value: 21_800, pct: 17 },
    { label: '45+', value: 10_400, pct: 8 },
  ] satisfies AnalyticsBreakdownRow[],
  gender: [
    { label: 'Women', value: 72_400, pct: 56 },
    { label: 'Men', value: 48_200, pct: 38 },
    { label: 'Other', value: 7_800, pct: 6 },
  ] satisfies AnalyticsBreakdownRow[],
  devices: [
    { label: 'Mobile', value: 98_600, pct: 77 },
    { label: 'Desktop', value: 22_400, pct: 17 },
    { label: 'Tablet', value: 7_400, pct: 6 },
  ] satisfies AnalyticsBreakdownRow[],
}

export const analyticsTrafficSources: AnalyticsTrafficSource[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    visits: 186_400,
    pct: 38,
    color: 'from-fuchsia-500 to-pink-500',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    visits: 112_200,
    pct: 23,
    color: 'from-rose-500 to-red-500',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    visits: 98_800,
    pct: 20,
    color: 'from-cyan-400 to-sky-500',
  },
  {
    id: 'google',
    label: 'Google',
    visits: 64_100,
    pct: 13,
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'direct',
    label: 'Direct / Other',
    visits: 29_500,
    pct: 6,
    color: 'from-violet-500 to-indigo-500',
  },
]

export const subscriptionOverview = {
  active: 3_842,
  newThisMonth: 286,
  churnRate: 2.4,
  mrr: 114_876,
  planName: 'Premium Monthly',
  planPrice: 299,
}

export const recentSubscribers: StudioSubscriber[] = [
  {
    id: 'sub1',
    name: 'Aisha Khan',
    handle: 'aishak',
    email: 'aisha@example.com',
    avatar: 'https://picsum.photos/id/64/100/100',
    plan: 'Monthly',
    renewalDate: '2026-08-12',
    amount: 299,
    totalPaid: 897,
    status: 'active',
    joinedAt: '2h ago',
    history: [
      { id: 'h1', label: 'Subscribed to Monthly', date: '2026-05-12', amount: 299 },
      { id: 'h2', label: 'Renewed Monthly', date: '2026-06-12', amount: 299 },
      { id: 'h3', label: 'Renewed Monthly', date: '2026-07-12', amount: 299 },
    ],
    payments: [
      { id: 'pay1', date: '2026-07-12', amount: 299, method: 'UPI', status: 'paid' },
      { id: 'pay2', date: '2026-06-12', amount: 299, method: 'Card', status: 'paid' },
      { id: 'pay3', date: '2026-05-12', amount: 299, method: 'UPI', status: 'paid' },
    ],
    messages: [
      { id: 'm1', from: 'fan', body: 'Loved the Paris drop 🔥', date: '2026-07-11' },
      { id: 'm2', from: 'creator', body: 'Thank you! More coming this week.', date: '2026-07-11' },
    ],
  },
  {
    id: 'sub2',
    name: 'Leo Martins',
    handle: 'leom',
    email: 'leo@example.com',
    avatar: 'https://picsum.photos/id/91/100/100',
    plan: 'Yearly',
    renewalDate: '2027-01-05',
    amount: 2_988,
    totalPaid: 2_988,
    status: 'active',
    joinedAt: '5h ago',
    history: [
      { id: 'h1', label: 'Subscribed to Yearly', date: '2026-01-05', amount: 2_988 },
    ],
    payments: [
      { id: 'pay1', date: '2026-01-05', amount: 2_988, method: 'Card', status: 'paid' },
    ],
    messages: [
      { id: 'm1', from: 'fan', body: 'Annual plan was the right call.', date: '2026-01-06' },
    ],
  },
  {
    id: 'sub3',
    name: 'Priya Shah',
    handle: 'priyashah',
    email: 'priya@example.com',
    avatar: 'https://picsum.photos/id/338/100/100',
    plan: 'VIP',
    renewalDate: '2026-08-01',
    amount: 799,
    totalPaid: 2_397,
    status: 'active',
    joinedAt: 'Yesterday',
    history: [
      { id: 'h1', label: 'Upgraded to VIP', date: '2026-05-01', amount: 799 },
      { id: 'h2', label: 'Renewed VIP', date: '2026-06-01', amount: 799 },
      { id: 'h3', label: 'Renewed VIP', date: '2026-07-01', amount: 799 },
    ],
    payments: [
      { id: 'pay1', date: '2026-07-01', amount: 799, method: 'Card', status: 'paid' },
      { id: 'pay2', date: '2026-06-01', amount: 799, method: 'UPI', status: 'paid' },
    ],
    messages: [
      { id: 'm1', from: 'fan', body: 'Can we do a VIP live next week?', date: '2026-07-09' },
      { id: 'm2', from: 'creator', body: 'Yes — locking Friday 8pm.', date: '2026-07-09' },
    ],
  },
  {
    id: 'sub4',
    name: 'Noah Park',
    handle: 'noahp',
    email: 'noah@example.com',
    avatar: 'https://picsum.photos/id/177/100/100',
    plan: 'Monthly',
    renewalDate: '2026-07-20',
    amount: 299,
    totalPaid: 598,
    status: 'past_due',
    joinedAt: 'Yesterday',
    history: [
      { id: 'h1', label: 'Subscribed to Monthly', date: '2026-05-20', amount: 299 },
      { id: 'h2', label: 'Payment failed', date: '2026-07-20' },
    ],
    payments: [
      { id: 'pay1', date: '2026-07-20', amount: 299, method: 'Card', status: 'failed' },
      { id: 'pay2', date: '2026-06-20', amount: 299, method: 'Card', status: 'paid' },
    ],
    messages: [
      { id: 'm1', from: 'creator', body: 'Hey Noah — renewal failed, update card anytime.', date: '2026-07-20' },
    ],
  },
  {
    id: 'sub5',
    name: 'Sofia Reyes',
    handle: 'sofia.r',
    email: 'sofia@example.com',
    avatar: 'https://picsum.photos/id/325/100/100',
    plan: 'Gold',
    renewalDate: '2026-09-01',
    amount: 1_499,
    totalPaid: 4_497,
    status: 'active',
    joinedAt: '3d ago',
    history: [
      { id: 'h1', label: 'Subscribed to Gold', date: '2026-06-01', amount: 1_499 },
      { id: 'h2', label: 'Renewed Gold', date: '2026-07-01', amount: 1_499 },
      { id: 'h3', label: 'Renewed Gold', date: '2026-08-01', amount: 1_499 },
    ],
    payments: [
      { id: 'pay1', date: '2026-08-01', amount: 1_499, method: 'Card', status: 'paid' },
      { id: 'pay2', date: '2026-07-01', amount: 1_499, method: 'Card', status: 'paid' },
    ],
    messages: [
      { id: 'm1', from: 'fan', body: 'Gold perks are unreal — thank you!', date: '2026-07-08' },
    ],
  },
  {
    id: 'sub6',
    name: 'Kenji Tanaka',
    handle: 'kenjit',
    email: 'kenji@example.com',
    avatar: 'https://picsum.photos/id/342/100/100',
    plan: 'VIP',
    renewalDate: '2026-06-15',
    amount: 799,
    totalPaid: 1_598,
    status: 'cancelled',
    joinedAt: '1w ago',
    history: [
      { id: 'h1', label: 'Subscribed to VIP', date: '2026-04-15', amount: 799 },
      { id: 'h2', label: 'Renewed VIP', date: '2026-05-15', amount: 799 },
      { id: 'h3', label: 'Cancelled VIP', date: '2026-06-10' },
    ],
    payments: [
      { id: 'pay1', date: '2026-05-15', amount: 799, method: 'UPI', status: 'paid' },
      { id: 'pay2', date: '2026-04-15', amount: 799, method: 'UPI', status: 'paid' },
    ],
    messages: [
      { id: 'm1', from: 'fan', body: ' Pausing for a bit — see you soon.', date: '2026-06-10' },
      { id: 'm2', from: 'creator', body: 'Door’s always open, Kenji 💛', date: '2026-06-10' },
    ],
  },
  {
    id: 'sub7',
    name: 'Nina Ortiz',
    handle: 'ninao',
    email: 'nina.o@example.com',
    avatar: 'https://picsum.photos/id/201/100/100',
    plan: 'Yearly',
    renewalDate: '2026-12-01',
    amount: 2_988,
    totalPaid: 2_988,
    status: 'active',
    joinedAt: '2w ago',
    history: [
      { id: 'h1', label: 'Subscribed to Yearly', date: '2025-12-01', amount: 2_988 },
    ],
    payments: [
      { id: 'pay1', date: '2025-12-01', amount: 2_988, method: 'Card', status: 'paid' },
    ],
    messages: [],
  },
  {
    id: 'sub8',
    name: 'Devon Blake',
    handle: 'devonb',
    email: 'devon@example.com',
    avatar: 'https://picsum.photos/id/1011/100/100',
    plan: 'Monthly',
    renewalDate: '2026-05-28',
    amount: 299,
    totalPaid: 897,
    status: 'cancelled',
    joinedAt: '1mo ago',
    history: [
      { id: 'h1', label: 'Subscribed to Monthly', date: '2026-02-28', amount: 299 },
      { id: 'h2', label: 'Cancelled Monthly', date: '2026-05-22' },
    ],
    payments: [
      { id: 'pay1', date: '2026-04-28', amount: 299, method: 'Card', status: 'paid' },
      { id: 'pay2', date: '2026-03-28', amount: 299, method: 'Card', status: 'refunded' },
    ],
    messages: [
      { id: 'm1', from: 'fan', body: 'Budget cut — will rejoin later.', date: '2026-05-22' },
    ],
  },
]

/** Alias used by the Subscribers management page. */
export const studioSubscribers = recentSubscribers


export const recentPurchases: StudioPurchase[] = [
  {
    id: 'buy1',
    buyer: 'Devon Blake',
    item: 'Behind the campaign reel',
    amount: 99,
    date: '1h ago',
  },
  {
    id: 'buy2',
    buyer: 'Mira Joshi',
    item: 'Exclusive night edit',
    amount: 149,
    date: '4h ago',
  },
  {
    id: 'buy3',
    buyer: 'Chris Nguyen',
    item: 'Premium Pack',
    amount: 799,
    date: 'Yesterday',
  },
  {
    id: 'buy4',
    buyer: 'Elena Ruiz',
    item: 'Digital Lookbook',
    amount: 399,
    date: '2d ago',
  },
]

export const recentComments: StudioComment[] = [
  {
    id: 'cm1',
    author: 'Jordan',
    avatar: 'https://picsum.photos/id/1011/100/100',
    body: 'This drop is unreal — more BTS please!',
    postTitle: 'Paris lookbook',
    createdAt: '35m ago',
  },
  {
    id: 'cm2',
    author: 'Sofia',
    avatar: 'https://picsum.photos/id/325/100/100',
    body: 'Subscribed just for this. Worth it.',
    postTitle: 'Studio session',
    createdAt: '2h ago',
  },
  {
    id: 'cm3',
    author: 'Kenji',
    avatar: 'https://picsum.photos/id/342/100/100',
    body: 'Lighting in this reel is chef’s kiss.',
    postTitle: 'Campaign reel',
    createdAt: '5h ago',
  },
  {
    id: 'cm4',
    author: 'Ava',
    avatar: 'https://picsum.photos/id/201/100/100',
    body: 'Can you do a tutorial on this look?',
    postTitle: 'Morning ritual',
    createdAt: 'Yesterday',
  },
]

export const studioNotifications = [
  {
    id: 'n1',
    title: 'New subscriber',
    body: 'Aisha Khan joined Premium',
    time: '12m ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Coffee received',
    body: 'Kenji sent ₹499',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'PPV sale',
    body: 'Behind the campaign reel unlocked',
    time: '3h ago',
    unread: false,
  },
]

