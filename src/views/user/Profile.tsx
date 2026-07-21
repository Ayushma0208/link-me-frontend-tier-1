'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight, LogOut } from 'lucide-react'

import {
  CreatorChipRow,
  MediaRail,
  ProfileSection,
} from '@/components/user/ProfileSections'
import { UserProfileHero } from '@/components/user/UserProfileHero'
import {
  demoUserProfile,
  getPurchasedPosts,
  getSavedPosts,
  getSubscriptionCreators,
  getWatchHistory,
  profileSettingsLinks,
  userProfileStats,
} from '@/data/user-profile'
import { useAuthStore } from '@/stores/auth'
import { useFollowStore } from '@/stores/follows'
import { cn } from '@/lib/utils'

export function UserProfile() {
  const authUser = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const prefersReducedMotion = useReducedMotion()
  const followed = useFollowStore((s) => s.byHandle)

  const profile = useMemo(
    () => ({
      name: authUser?.name || demoUserProfile.name,
      username: authUser?.username || demoUserProfile.username,
      bio: demoUserProfile.bio,
      avatar: authUser?.avatar || demoUserProfile.avatar,
      coverImage: demoUserProfile.coverImage,
      joinedLabel: demoUserProfile.joinedLabel,
    }),
    [authUser]
  )

  const following = useMemo(
    () =>
      Object.values(followed).map((c) => ({
        id: c.id,
        name: c.name,
        handle: c.handle,
        avatar: c.avatar,
        href: c.href,
        meta: c.category ?? 'Creator',
      })),
    [followed]
  )
  const subscriptions = useMemo(() => getSubscriptionCreators(), [])
  const purchased = useMemo(() => getPurchasedPosts(), [])
  const saved = useMemo(() => getSavedPosts(), [])
  const watchHistory = useMemo(() => getWatchHistory(), [])

  const stats = [
    { label: 'Followers', value: userProfileStats.followers },
    { label: 'Following', value: following.length, href: '/user/following' },
    {
      label: 'Subs',
      value: userProfileStats.subscriptions,
      href: '/user/subscriptions',
    },
    { label: 'Purchased', value: userProfileStats.purchased },
    { label: 'Saved', value: userProfileStats.saved, href: '/user/saved' },
    { label: 'Watched', value: userProfileStats.watched },
  ]

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-1">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase"
        >
          Your space
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-extrabold tracking-tight text-white"
        >
          Profile
        </motion.h1>
      </header>

      <UserProfileHero
        name={profile.name}
        username={profile.username}
        bio={profile.bio}
        avatar={profile.avatar}
        coverImage={profile.coverImage}
        joinedLabel={profile.joinedLabel}
        stats={stats}
      />

      <ProfileSection
        title="Subscriptions"
        subtitle="Creators you support monthly"
        href="/user/subscriptions"
      >
        <CreatorChipRow
          creators={subscriptions}
          emptyLabel="No active subscriptions yet"
        />
      </ProfileSection>

      <ProfileSection
        title="Following"
        subtitle="Creators you follow"
        href="/user/following"
      >
        <CreatorChipRow creators={following} emptyLabel="Follow creators to see them here" />
      </ProfileSection>

      <ProfileSection
        title="Purchased posts"
        subtitle="One-time unlocks you own"
        href="/user/wallet"
      >
        <MediaRail items={purchased} emptyLabel="No purchased posts yet" />
      </ProfileSection>

      <ProfileSection
        title="Saved posts"
        subtitle="Bookmarked for later"
        href="/user/saved"
      >
        <MediaRail items={saved} emptyLabel="No saved posts yet" />
      </ProfileSection>

      <ProfileSection
        title="Watch history"
        subtitle="Recently viewed exclusives"
      >
        <MediaRail items={watchHistory} emptyLabel="Nothing watched yet" />
      </ProfileSection>

      <ProfileSection title="Settings" subtitle="Manage your account">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
          {profileSettingsLinks.map((item, index) => (
            <motion.div
              key={item.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.04 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.05]',
                  index !== profileSettingsLinks.length - 1 && 'border-b border-white/[0.06]'
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-white">
                    {item.title}
                  </span>
                  <span className="block text-[12px] text-white/40">
                    {item.description}
                  </span>
                </span>
                <ChevronRight className="size-4 text-white/30" aria-hidden />
              </Link>
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            logout()
            window.location.href = '/login'
          }}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 text-[14px] font-semibold text-red-200 transition hover:bg-red-500/15"
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </button>
      </ProfileSection>
    </div>
  )
}
