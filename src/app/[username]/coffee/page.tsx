'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Logo } from '@/components/layout/Logo'
import {
  buildCustomPublicCreator,
  getPublicCreator,
  type PublicCreator,
} from '@/data/public-creator'
import { api } from '@/lib/api'
import { BuyMeCoffeePage } from '@/views/public/BuyMeCoffeePage'

export default function CreatorCoffeeRoute() {
  const params = useParams<{ username: string }>()
  const username = decodeURIComponent(String(params.username ?? '')).replace(
    /^@/,
    ''
  )
  const catalog = getPublicCreator(username)
  const [creator, setCreator] = useState<PublicCreator | null>(catalog)
  const [loading, setLoading] = useState(!catalog)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api<{
          profile: {
            id: string
            bio: string
            coverImageUrl: string | null
            coffee: { enabled: boolean }
            user: {
              id: string
              username: string
              displayName: string
              avatarUrl: string | null
              isVerified: boolean
            }
            pricing: { imagePrice: string | null }
          }
        }>(`/creators/${encodeURIComponent(username.toLowerCase())}`)
        if (cancelled) return
        const p = data.profile
        if (!p.coffee.enabled) {
          setCreator(null)
          setLoading(false)
          return
        }
        const mapped = buildCustomPublicCreator(p.user.username, {
          name: p.user.displayName,
          avatar: p.user.avatarUrl || undefined,
          bio: p.bio,
          coverImage: p.coverImageUrl || undefined,
        })
        setCreator({
          ...mapped,
          id: p.user.id,
          creatorProfileId: p.id,
          verified: p.user.isVerified,
          coffeePrice: 99,
        })
      } catch {
        if (!cancelled) {
          const fallback = getPublicCreator(username)
          setCreator(fallback)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [username])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-black text-white/45">
        Loading coffee page…
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-black px-6 text-center text-white">
        <Logo markSize="lg" />
        <h1 className="mt-8 text-2xl font-bold">Creator not found</h1>
        <p className="mt-2 text-white/45">No coffee page for @{username}.</p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          Back home
        </Link>
      </div>
    )
  }

  return <BuyMeCoffeePage creator={creator} />
}
