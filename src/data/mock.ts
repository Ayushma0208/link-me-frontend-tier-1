import type { InfluencerProfile, PlatformStats } from '@/types'

export const mockInfluencer: InfluencerProfile = {
  id: 'inf-1',
  userId: 'user-1',
  name: 'Rick Ross',
  username: 'richforever',
  bio: '💿 "Set In Stone" Album Out July 17\nRick Ross Car Show June 13 🏁\n"Renaissance of a Boss" out now 📖\nMMG empire',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=richforever',
  videoMaskStyle: 'hexagon',
  verified: true,
  followers: 43_700_000,
  socialLinks: [
    { id: '1', platform: 'Instagram', url: '#', icon: 'instagram' },
    { id: '2', platform: 'Spotify', url: '#', icon: 'spotify' },
    { id: '3', platform: 'Apple Music', url: '#', icon: 'apple-music' },
    { id: '4', platform: 'YouTube', url: '#', icon: 'youtube' },
    { id: '5', platform: 'Twitter', url: '#', icon: 'twitter' },
    { id: '6', platform: 'Tidal', url: '#', icon: 'tidal' },
  ],
  highlights: [
    { id: 'h1', title: 'Album', thumbnail: '', type: 'video' },
    { id: 'h2', title: 'Tour', thumbnail: '', type: 'story' },
    { id: 'h3', title: 'Behind', thumbnail: '', type: 'image' },
    { id: 'h4', title: 'Live', thumbnail: '', type: 'video' },
  ],
  subscriptionPlans: [
    {
      id: 'plan-1',
      name: 'Image Access',
      price: 9.99,
      duration: 'monthly',
      features: ['Exclusive photos', 'Behind the scenes', 'Early drops'],
      type: 'image',
    },
    {
      id: 'plan-2',
      name: 'Video Access',
      price: 19.99,
      duration: 'monthly',
      features: ['All videos', 'Live streams', 'AI voice calls'],
      type: 'video',
    },
    {
      id: 'plan-3',
      name: 'VIP Full Access',
      price: 49.99,
      duration: 'monthly',
      features: ['Everything', 'AI Chat', 'Priority DMs', 'Emoji tips'],
      type: 'full',
    },
  ],
  subdomain: 'richforever.linkme.app',
}

export const mockPlatformStats: PlatformStats = {
  totalInfluencers: 1248,
  totalUsers: 89420,
  totalRevenue: 284750,
  activeSubscriptions: 15632,
}

export const mockInfluencers = [
  mockInfluencer,
  {
    ...mockInfluencer,
    id: 'inf-2',
    name: 'Priya Sharma',
    username: 'priyasharma',
    verified: false,
    followers: 2_400_000,
    videoMaskStyle: 'splash-water' as const,
    bio: 'Tamil + English creator 🇮🇳\nFashion | Lifestyle | Tanglish vibes',
    subdomain: 'priyasharma.linkme.app',
  },
  {
    ...mockInfluencer,
    id: 'inf-3',
    name: 'Alex Creator',
    username: 'alexc',
    verified: true,
    followers: 890_000,
    videoMaskStyle: 'text-overlay' as const,
    bio: 'AI fashion & virtual try-on\nDM for collabs',
    subdomain: 'alexc.linkme.app',
  },
]
