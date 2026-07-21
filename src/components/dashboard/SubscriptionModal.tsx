'use client'

import { UnlockModal, type UnlockTarget } from '@/components/user/UnlockModal'
import type { FeedCreator, FeedPost } from '@/data/user-feed'

export interface SubscriptionModalProps {
  open: boolean
  post: FeedPost | null
  creator: FeedCreator | null
  onClose: () => void
  onBuyPost?: (postId: string) => void
  onSubscribe?: (creatorId: string) => void
}

/** Premium unlock sheet for locked feed posts (PPV or subscribe). */
export function SubscriptionModal({
  open,
  post,
  creator,
  onClose,
  onBuyPost,
  onSubscribe,
}: SubscriptionModalProps) {
  const target: UnlockTarget | null =
    post && creator
      ? {
          postId: post.id,
          title: post.title,
          price: post.price ?? 99,
          thumbnailUrl: post.thumbnailUrl,
          blurredThumbnailUrl: post.blurredThumbnailUrl,
          creator,
          lockKind: post.lockKind === 'subscribers' ? 'subscribers' : 'ppv',
          alreadySubscribed: Boolean(creator.isSubscribed),
        }
      : null

  return (
    <UnlockModal
      open={open}
      target={target}
      onClose={onClose}
      onBuyPost={onBuyPost}
      onSubscribe={onSubscribe}
      postPrice={post?.price ?? 99}
      subscriptionPrice={creator?.monthlyPrice ?? 299}
    />
  )
}
