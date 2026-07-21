import {
  BarChart3,
  Bell,
  Crown,
  Heart,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface DemoFeatureCard {
  id: string
  title: string
  description: string
  icon: LucideIcon
  position: string
}

export interface DemoNotification {
  id: string
  title: string
  body: string
  icon: LucideIcon
  position: string
}

export const productDemo = {
  badge: 'Product demo',
  title: 'Your page feels like an app',
  description:
    'Preview how fans experience your profile — video, subscriptions, and social proof in one premium mobile surface.',
  videoSrc: 'https://videos.pexels.com/video-files/5752729/5752729-uhd_2560_1440_30fps.mp4',
  videoPoster: 'https://picsum.photos/id/1015/600/1200',
}

export const demoFeatureCards: DemoFeatureCard[] = [
  {
    id: 'tips',
    title: 'Tips unlocked',
    description: 'Fans can tip in one tap',
    icon: Heart,
    position: 'left-[2%] top-[18%] lg:-left-6 lg:top-[16%]',
  },
  {
    id: 'boost',
    title: 'Boost live',
    description: 'Promote your top drop',
    icon: Zap,
    position: 'right-[2%] top-[22%] lg:-right-4 lg:top-[20%]',
  },
]

export const demoNotifications: DemoNotification[] = [
  {
    id: 'new-sub',
    title: 'New subscriber',
    body: 'Alex just joined Pro',
    icon: Bell,
    position: 'left-[4%] bottom-[28%] lg:-left-10 lg:bottom-[30%]',
  },
  {
    id: 'spark',
    title: 'Trending today',
    body: '+214% profile views',
    icon: Sparkles,
    position: 'right-[4%] bottom-[24%] lg:-right-8 lg:bottom-[26%]',
  },
]

export const demoSubscription = {
  title: 'Join Pro',
  price: '$9.99',
  period: '/mo',
  cta: 'Subscribe',
  icon: Crown,
  position: 'left-1/2 top-[8%] -translate-x-1/2 lg:left-auto lg:right-[8%] lg:top-[8%] lg:translate-x-0',
}

export const demoAnalytics = {
  title: 'This week',
  metric: '38.4K',
  label: 'Profile visits',
  change: '+18%',
  icon: BarChart3,
  position: 'left-1/2 bottom-[6%] -translate-x-1/2 lg:left-[6%] lg:bottom-[10%] lg:translate-x-0',
}
