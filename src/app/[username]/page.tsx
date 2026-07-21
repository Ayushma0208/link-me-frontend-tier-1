import type { Metadata } from 'next'

import { getPublicCreator } from '@/data/public-creator'
import { PublicCreatorProfile } from '@/views/public/PublicCreatorProfile'

type PageProps = {
  params: Promise<{ username: string }>
}

async function fetchLiveCreatorMeta(username: string) {
  try {
    const apiUrl = process.env.API_URL ?? 'http://localhost:4000'
    const res = await fetch(
      `${apiUrl}/api/v1/creators/${encodeURIComponent(username.toLowerCase())}`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return null
    const json = (await res.json()) as {
      success?: boolean
      data?: {
        profile?: {
          bio?: string
          coverImageUrl?: string | null
          user?: {
            username?: string
            displayName?: string
            avatarUrl?: string | null
          }
        }
      }
    }
    const profile = json.data?.profile
    if (!profile?.user?.username) return null
    return {
      name: profile.user.displayName || profile.user.username,
      handle: profile.user.username,
      bio: profile.bio || 'Creator on Linkme',
      coverImage:
        profile.coverImageUrl ||
        profile.user.avatarUrl ||
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
    }
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username: raw } = await params
  const username = decodeURIComponent(raw).replace(/^@/, '')
  const live = await fetchLiveCreatorMeta(username)
  const catalog = getPublicCreator(username)
  const creator = live || catalog

  if (!creator) {
    return {
      title: 'Creator not found · Linkme',
    }
  }

  const title = `${creator.name} (@${creator.handle}) · Linkme`
  const description = creator.bio.replace(/\n/g, ' ')
  const url = `/@${creator.handle}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      images: [
        {
          url: creator.coverImage,
          width: 1600,
          height: 900,
          alt: creator.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [creator.coverImage],
    },
  }
}

export default function CreatorUsernamePage() {
  return <PublicCreatorProfile />
}
