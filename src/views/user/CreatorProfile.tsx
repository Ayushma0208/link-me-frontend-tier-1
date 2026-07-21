'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

import { CreatorPostGrid } from '@/components/user/CreatorPostGrid'
import { CreatorProfileHeader } from '@/components/user/CreatorProfileHeader'
import {
  buildCreatorHighlights,
  StoryHighlights,
} from '@/components/user/StoryHighlights'
import { UnlockModal, type UnlockTarget } from '@/components/user/UnlockModal'
import {
  feedCreatorsByHandle,
  getCreatorProfilePosts,
  type CreatorProfilePost,
} from '@/data/user-feed'
import { useFollowStore } from '@/stores/follows'

export function UserCreatorProfile() {
  const params = useParams<{ username: string }>()
  const router = useRouter()
  const handle = String(params.username ?? '').toLowerCase()

  const creator = feedCreatorsByHandle[handle]
  const following = useFollowStore((s) =>
    creator
      ? Boolean(s.byHandle[creator.handle.replace(/^@/, '').toLowerCase()])
      : false
  )
  const toggleFollow = useFollowStore((s) => s.toggle)
  const [subscribed, setSubscribed] = useState(Boolean(creator?.isSubscribed))
  const [unlockTarget, setUnlockTarget] = useState<UnlockTarget | null>(null)

  const highlights = useMemo(
    () => (creator ? buildCreatorHighlights(creator.id) : []),
    [creator]
  )

  const posts = useMemo(() => {
    if (!creator) return []
    return getCreatorProfilePosts(creator.id).map((post, index) => {
      if (subscribed) return { ...post, locked: false, price: 0 }
      // First two always free for preview; rest locked
      if (index < 2) return { ...post, locked: false, price: 0 }
      return {
        ...post,
        locked: true,
        price: 49,
      }
    })
  }, [creator, subscribed])

  if (!creator) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Creator not found</h1>
        <p className="mt-2 text-white/45">That profile isn’t available.</p>
        <button
          type="button"
          onClick={() => router.push('/user/explore')}
          className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          Explore creators
        </button>
      </div>
    )
  }

  function openUnlock(post: CreatorProfilePost) {
    setUnlockTarget({
      postId: post.id,
      title: post.title,
      price: 49,
      thumbnailUrl: post.thumbnailUrl,
      blurredThumbnailUrl: post.blurredThumbnailUrl,
      creator: { ...creator, monthlyPrice: 299 },
    })
  }

  function openSubscribe() {
    if (subscribed) {
      setSubscribed(false)
      return
    }
    setUnlockTarget({
      postId: `sub-${creator.id}`,
      title: `Subscribe to ${creator.name}`,
      price: 49,
      thumbnailUrl: creator.coverImage,
      creator: { ...creator, monthlyPrice: 299 },
    })
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <motion.button
        type="button"
        onClick={() => router.back()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-flex items-center gap-2 text-[13px] text-white/45 transition hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </motion.button>

      <CreatorProfileHeader
        creator={creator}
        following={following}
        subscribed={subscribed}
        onFollow={() => {
          if (!creator) return
          toggleFollow({
            id: creator.id,
            handle: creator.handle,
            name: creator.name,
            avatar: creator.avatar,
            category: creator.category,
            href: `/user/creator/${creator.handle}`,
          })
        }}
        onSubscribe={openSubscribe}
      />

      <StoryHighlights highlights={highlights} />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-semibold tracking-[0.14em] text-white/35 uppercase"
            >
              Posts
            </motion.p>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Exclusive content
            </h2>
          </div>
          <p className="text-[12px] text-white/40">
            {subscribed ? 'All unlocked' : 'First 2 free · rest locked'}
          </p>
        </div>

        <CreatorPostGrid
          posts={posts}
          freeCount={2}
          onUnlock={openUnlock}
          onSubscribe={openSubscribe}
        />
      </section>

      <UnlockModal
        open={Boolean(unlockTarget)}
        target={unlockTarget}
        onClose={() => setUnlockTarget(null)}
        onBuyPost={() => setUnlockTarget(null)}
        onSubscribe={() => {
          setSubscribed(true)
          setUnlockTarget(null)
        }}
      />
    </div>
  )
}
