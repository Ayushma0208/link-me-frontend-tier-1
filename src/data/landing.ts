import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Link2,
  Lock,
  Package,
  Repeat,
  Zap,
} from 'lucide-react'

export interface FeatureItem {
  id: string
  title: string
  description: string
  icon: LucideIcon
  /** Tailwind gradient classes for the card accent, e.g. `from-sky-400/40 to-cyan-300/10` */
  accent: string
}

export const features: FeatureItem[] = [
  {
    id: 'exclusive-content',
    title: 'Exclusive Content',
    description:
      'Gate photos, videos, and drops behind your page so fans unlock what only your community gets.',
    icon: Lock,
    accent: 'from-white/25 via-white/5 to-transparent',
  },
  {
    id: 'monthly-subscriptions',
    title: 'Monthly Subscriptions',
    description:
      'Recurring memberships with tiers, perks, and automatic renewals that compound every month.',
    icon: Repeat,
    accent: 'from-sky-300/30 via-white/5 to-transparent',
  },
  {
    id: 'digital-products',
    title: 'Digital Products',
    description:
      'Sell courses, presets, ebooks, and downloads in one tap — no storefront rebuild required.',
    icon: Package,
    accent: 'from-emerald-300/25 via-white/5 to-transparent',
  },
  {
    id: 'social-links',
    title: 'Social Links',
    description:
      'Connect Instagram, TikTok, YouTube, and more so every profile points back to one home.',
    icon: Link2,
    accent: 'from-violet-300/25 via-white/5 to-transparent',
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description:
      'Track clicks, conversions, and top links with a clean dashboard built for decisions.',
    icon: BarChart3,
    accent: 'from-amber-300/25 via-white/5 to-transparent',
  },
  {
    id: 'instant-payments',
    title: 'Instant Payments',
    description:
      'Accept tips, checkout, and payouts fast — money hits your wallet without the wait.',
    icon: Zap,
    accent: 'from-rose-300/25 via-white/5 to-transparent',
  },
]

export type BillingPeriod = 'monthly' | 'yearly'

export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  cta: string
  highlighted: boolean
  badge?: string
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Launch your page and share your first links.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Custom bio link',
      'Unlimited links',
      'Basic analytics',
      'Mobile-optimized page',
    ],
    cta: 'Start for free',
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Grow with richer media and simple monetization.',
    monthlyPrice: 12,
    yearlyPrice: 120,
    features: [
      'Everything in Free',
      'Custom themes',
      'Video embeds',
      'Email capture',
      'Tip jar',
    ],
    cta: 'Choose Starter',
    highlighted: false,
  },
  {
    id: 'creator-pro',
    name: 'Creator Pro',
    description: 'For creators ready to monetize every click.',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Everything in Starter',
      'Paid links & tips',
      'Monthly subscriptions',
      'Custom branding',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Go Creator Pro',
    highlighted: true,
    badge: 'Popular',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Teams, agencies, and multi-creator brands.',
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      'Everything in Creator Pro',
      'Team seats',
      'Custom domain',
      'API access',
      'Dedicated success manager',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
]

export function formatPlanPrice(plan: PricingPlan, billing: BillingPeriod): string {
  const amount = billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)
  if (amount === 0) return '$0'
  return `$${amount}`
}

export function getPlanPeriodLabel(plan: PricingPlan, billing: BillingPeriod): string {
  if (plan.monthlyPrice === 0) return 'forever'
  return billing === 'monthly' ? '/month' : '/month, billed yearly'
}

export const YEARLY_SAVINGS_PERCENT = 17

export const testimonials = [
  {
    id: '1',
    quote:
      'I replaced five tools with Linkme. Tips, memberships, and DMs finally live in one place.',
    name: 'Ava Morrison',
    role: 'Lifestyle creator',
    avatar: 'https://picsum.photos/id/64/120/120',
  },
  {
    id: '2',
    quote:
      'The profile looks like a real product, not a link tree. Conversion jumped in the first week.',
    name: 'Chris Delgado',
    role: 'Fitness coach',
    avatar: 'https://picsum.photos/id/91/120/120',
  },
  {
    id: '3',
    quote:
      'Paid calls and chat pricing paid for itself. Fans get access. I get paid. Simple.',
    name: 'Priya Nair',
    role: 'Musician',
    avatar: 'https://picsum.photos/id/338/120/120',
  },
]

export const faqs = [
  {
    id: '1',
    question: 'Is Linkme free to start?',
    answer:
      'Yes. You can create your page, add links, and share it for free. Upgrade when you’re ready to unlock monetization and branding.',
  },
  {
    id: '2',
    question: 'How do payouts work?',
    answer:
      'Earnings land in your wallet. Withdraw on your schedule with supported payment methods in your region.',
  },
  {
    id: '3',
    question: 'Can I use my own domain?',
    answer:
      'Pro and Business plans support custom domains so your page matches your brand end to end.',
  },
  {
    id: '4',
    question: 'Does it work on mobile?',
    answer:
      'Linkme is mobile-first. Your page is designed to feel like a premium app on every phone.',
  },
  {
    id: '5',
    question: 'Can fans tip and subscribe?',
    answer:
      'Absolutely. Offer tips, memberships, per-message chat, and paid media from a single profile.',
  },
]
