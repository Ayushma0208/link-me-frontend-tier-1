'use client'

import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Camera,
  Check,
  Calendar,
  Coffee,
  CreditCard,
  ExternalLink,
  Globe,
  Link2,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { AppearanceControls } from '@/components/creator-studio/AppearanceControls'
import { CoverMediaPicker } from '@/components/creator-studio/CoverMediaPicker'
import { ProfileThemePreview } from '@/components/creator-studio/ProfileThemePreview'
import { PublicUrlField } from '@/components/creator-studio/PublicUrlField'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import {
  defaultCoffeeConfig,
  subscriptionOverview,
} from '@/data/creator-studio'
import { api, ApiError } from '@/lib/api'
import {
  mapBackendUser,
  type BackendPublicUser,
} from '@/lib/auth-map'
import { uploadMediaFile } from '@/lib/media-upload'
import {
  PUBLIC_URL_HOST,
  publicProfileUrl,
  validatePublicUsername,
} from '@/lib/profile-appearance'
import { fetchCreatorDashboard } from '@/lib/studio-api'
import { useAuthStore } from '@/stores/auth'
import { useCreatorPageStore } from '@/stores/creator-page'
import { cn, formatCurrency } from '@/lib/utils'

const FALLBACK_AVATAR =
  'https://api.dicebear.com/9.x/initials/svg?seed=Creator'

const CATEGORIES = [
  'Fashion',
  'Travel',
  'Lifestyle',
  'Fitness',
  'Beauty',
  'Music',
  'Comedy',
  'Education',
  'Food',
  'Tech',
]

function SectionTitle({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description?: string
  icon?: ComponentType<{ className?: string }>
}) {
  return (
    <div className="mb-4 flex items-start gap-2.5">
      {Icon ? (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
          <Icon className="size-3.5 text-fuchsia-300" />
        </div>
      ) : null}
      <div>
        <h2 className="text-[15px] font-bold text-white">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-white/45">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left"
    >
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-white/80">{label}</p>
        {description ? (
          <p className="mt-0.5 text-[11px] text-white/40">{description}</p>
        ) : null}
      </div>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-fuchsia-500' : 'bg-white/15'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </span>
    </button>
  )
}

const fieldClass =
  'mt-2 h-11 w-full rounded-2xl border border-white/12 bg-white/[0.05] px-3.5 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-fuchsia-400/40'

export function ProfileSettingsStudio() {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const publicUsername = useCreatorPageStore((s) => s.publicUsername)
  const claimedUsername = useCreatorPageStore((s) => s.claimedUsername)
  const appearance = useCreatorPageStore((s) => s.appearance)
  const setPublicUsername = useCreatorPageStore((s) => s.setPublicUsername)
  const setAppearance = useCreatorPageStore((s) => s.setAppearance)
  const commitPublicUsername = useCreatorPageStore((s) => s.commitPublicUsername)
  const syncFromAuth = useCreatorPageStore((s) => s.syncFromAuth)

  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [avatar, setAvatar] = useState(user?.avatar || FALLBACK_AVATAR)
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [bio, setBio] = useState('')
  const [category, setCategory] = useState('Fashion')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [bookingUrl, setBookingUrl] = useState('')
  const [links, setLinks] = useState<
    { id: string; platform: string; url: string }[]
  >([])
  const [customLinkLabel, setCustomLinkLabel] = useState('')
  const [customLinkUrl, setCustomLinkUrl] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const [subsEnabled, setSubsEnabled] = useState(true)
  const [monthlyPrice, setMonthlyPrice] = useState(
    String(subscriptionOverview.planPrice)
  )
  const [ppvPrice, setPpvPrice] = useState('149')

  const [coffeeEnabled, setCoffeeEnabled] = useState(defaultCoffeeConfig.enabled)
  const [coffeeButton, setCoffeeButton] = useState(defaultCoffeeConfig.buttonText)
  const [coffeeAmounts, setCoffeeAmounts] = useState(
    defaultCoffeeConfig.suggestedAmounts.join(', ')
  )
  const [coffeeThanks, setCoffeeThanks] = useState(
    defaultCoffeeConfig.thankYouMessage
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { profile } = await fetchCreatorDashboard()
        if (cancelled) return
        const authUser = useAuthStore.getState().user
        const name = profile.user.displayName || authUser?.name || ''
        const handle = profile.user.username || authUser?.username || ''
        const nextAvatar =
          profile.user.avatarUrl || authUser?.avatar || FALLBACK_AVATAR
        setDisplayName(name)
        setAvatar(nextAvatar)
        // Keep navbar/sidebar in sync with server profile
        if (authUser) {
          setUser({
            ...authUser,
            name: name || authUser.name,
            username: handle || authUser.username,
            avatar: profile.user.avatarUrl || authUser.avatar,
          })
        }
        setBio(profile.bio || '')
        setCategory(profile.category || 'Fashion')
        setLocation(profile.location || '')
        setWebsite(profile.website || '')
        setBookingUrl(profile.bookingUrl || '')
        setCustomLinkLabel(profile.customLinkLabel || '')
        setCustomLinkUrl(profile.customLinkUrl || '')
        setSeoTitle(profile.seoTitle || '')
        setSeoDescription(profile.seoDescription || '')
        setSubsEnabled(profile.isAcceptingSubs)
        setCoffeeEnabled(profile.coffee?.enabled ?? defaultCoffeeConfig.enabled)
        setCoffeeButton(
          profile.coffee?.buttonText || defaultCoffeeConfig.buttonText
        )
        setCoffeeThanks(
          profile.coffee?.thankYouMessage || defaultCoffeeConfig.thankYouMessage
        )
        if (handle) {
          setPublicUsername(handle)
          syncFromAuth(handle)
        }
        if (profile.coverImageUrl) {
          setAppearance({
            coverType: 'image',
            coverImage: profile.coverImageUrl,
          })
        } else if (profile.coverVideoUrl) {
          setAppearance({
            coverType: 'video',
            coverVideo: profile.coverVideoUrl,
          })
        }
        const featured = profile.plans.find((p) => p.isFeatured && p.isActive)
        const plan = featured || profile.plans.find((p) => p.isActive)
        if (plan) setMonthlyPrice(String(Number(plan.price) || monthlyPrice))
      } catch {
        if (!cancelled && user) {
          setDisplayName(user.name || '')
          setAvatar(user.avatar || FALLBACK_AVATAR)
          if (user.username) {
            setPublicUsername(user.username)
            syncFromAuth(user.username)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, [])

  const urlCheck = validatePublicUsername(publicUsername, claimedUsername)

  const seoPreviewTitle = useMemo(() => {
    if (seoTitle.trim()) return seoTitle.trim()
    return `${displayName || 'Creator'} (@${publicUsername || 'username'})`
  }, [seoTitle, displayName, publicUsername])
  const seoPreviewDesc = useMemo(
    () => seoDescription.trim() || bio.split('\n')[0] || 'Creator on Link.me',
    [seoDescription, bio]
  )
  const seoUrl = `https://${PUBLIC_URL_HOST}/@${publicUsername || 'username'}`

  async function handleAvatarFile(file: File) {
    setUploadingAvatar(true)
    setSaveError('')
    try {
      const { url } = await uploadMediaFile({
        file,
        purpose: 'AVATAR',
        type: 'IMAGE',
      })
      if (!url) throw new Error('Avatar upload returned no URL')
      setAvatar(url)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Avatar upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleCoverFile(file: File) {
    setUploadingCover(true)
    setSaveError('')
    try {
      const { url } = await uploadMediaFile({
        file,
        purpose: 'COVER',
        type: 'IMAGE',
      })
      if (!url) throw new Error('Cover upload returned no URL')
      setAppearance({ coverType: 'image', coverImage: url })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Cover upload failed')
      throw err
    } finally {
      setUploadingCover(false)
    }
  }

  function updateLink(id: string, field: 'platform' | 'url', value: string) {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    )
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((link) => link.id !== id))
  }

  function addLink() {
    setLinks((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, platform: 'New link', url: 'https://' },
    ])
  }

  async function save() {
    if (!urlCheck.ok || saving) return
    setSaving(true)
    setSaveError('')
    try {
      const username = publicUsername.replace(/^@/, '').trim().toLowerCase()

      const authResult = await api<{ user: BackendPublicUser }>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: displayName.trim(),
          username,
          avatarUrl: avatar.startsWith('http') ? avatar : undefined,
        }),
      })
      setUser(mapBackendUser(authResult.user))

      await api('/creators/me', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio,
          category: category || null,
          location: location || null,
          website: website || null,
          bookingUrl: bookingUrl || null,
          customLinkLabel: customLinkLabel || null,
          customLinkUrl: customLinkUrl || null,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
          isAcceptingSubs: subsEnabled,
          accentColor: appearance.accent,
          theme: appearance.theme,
        }),
      })

      if (avatar.startsWith('http')) {
        await api('/creators/me/avatar', {
          method: 'PUT',
          body: JSON.stringify({ avatarUrl: avatar }),
        })
      }

      if (appearance.coverType === 'image' && appearance.coverImage) {
        // Local video presets aren't CDN URLs — only persist http(s) covers
        if (/^https?:\/\//i.test(appearance.coverImage)) {
          await api('/creators/me/cover', {
            method: 'PUT',
            body: JSON.stringify({
              coverImageUrl: appearance.coverImage,
              coverVideoUrl: null,
            }),
          })
        }
      } else if (
        appearance.coverType === 'video' &&
        /^https?:\/\//i.test(appearance.coverVideo)
      ) {
        await api('/creators/me/cover', {
          method: 'PUT',
          body: JSON.stringify({
            coverVideoUrl: appearance.coverVideo,
            coverImageUrl: null,
          }),
        })
      }

      await api('/creators/me/coffee', {
        method: 'PUT',
        body: JSON.stringify({
          isCoffeeEnabled: coffeeEnabled,
          coffeeButtonText: coffeeButton,
          coffeeThankYouMsg: coffeeThanks || null,
        }),
      })

      commitPublicUsername()
      syncFromAuth(username)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not save profile'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <StudioPageHeader
        title="Profile Settings"
        description="Craft your public creator page — identity, monetization, theme, and SEO in one place."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/@${claimedUsername || publicUsername || user?.username || ''}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-[13px] font-semibold text-white hover:bg-white/[0.1]"
            >
              <ExternalLink className="size-3.5" />
              View page
            </Link>
            <motion.button
              type="button"
              onClick={() => void save()}
              disabled={!urlCheck.ok || saving || loading}
              whileHover={
                prefersReducedMotion || !urlCheck.ok ? undefined : { y: -2 }
              }
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 text-[13px] font-semibold text-white shadow-[0_12px_32px_rgba(217,70,239,0.35)] disabled:opacity-45"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : saved ? (
                <>
                  <Check className="size-4" />
                  Saved
                </>
              ) : (
                'Save changes'
              )}
            </motion.button>
          </div>
        }
      />

      {saveError ? (
        <p className="mb-4 text-[13px] text-rose-300">{saveError}</p>
      ) : null}
      {loading ? (
        <p className="mb-4 flex items-center gap-2 text-[13px] text-white/45">
          <Loader2 className="size-3.5 animate-spin" />
          Loading your profile…
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* Profile photo + cover */}
          <StudioGlassCard className="overflow-hidden p-0">
            <div className="relative h-44 sm:h-56">
              {appearance.coverType === 'video' ? (
                <video
                  src={appearance.coverVideo}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <Image
                  src={appearance.coverImage}
                  alt="Cover"
                  fill
                  sizes="800px"
                  className="object-cover"
                  unoptimized={
                    appearance.coverImage.includes('cloudinary') ||
                    appearance.coverImage.includes('dicebear')
                  }
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <div className="absolute right-4 bottom-4 rounded-full border border-white/15 bg-black/50 px-3.5 py-2 text-[12px] font-semibold text-white backdrop-blur-md">
                {appearance.coverType === 'video' ? 'Video cover' : 'Cover image'}
              </div>
            </div>
            <div className="relative px-5 pb-5 sm:px-6">
              <div className="relative -mt-12 inline-block">
                <div className="relative size-24 overflow-hidden rounded-[28px] border-4 border-[#0a0a10] ring-1 ring-white/15 sm:size-28">
                  <Image
                    src={avatar}
                    alt="Profile"
                    fill
                    sizes="112px"
                    className="object-cover"
                    unoptimized={
                      avatar.includes('cloudinary') ||
                      avatar.includes('dicebear') ||
                      avatar.startsWith('data:')
                    }
                  />
                </div>
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg disabled:opacity-60"
                  aria-label="Upload profile photo"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Camera className="size-4" />
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) void handleAvatarFile(file)
                  }}
                />
              </div>
              <p className="mt-3 text-[12px] text-white/40">
                Profile photo · tap the camera to upload (Cloudinary)
              </p>
            </div>
          </StudioGlassCard>

          <StudioGlassCard className="p-5 sm:p-6">
            <CoverMediaPicker
              appearance={appearance}
              onChange={setAppearance}
              onUploadImage={handleCoverFile}
              uploading={uploadingCover}
            />
          </StudioGlassCard>

          {/* Identity */}
          <StudioGlassCard className="p-5 sm:p-6">
            <SectionTitle
              title="Identity"
              description="How you appear across Link.me"
            />
            <PublicUrlField
              value={publicUsername}
              currentUsername={claimedUsername}
              onChange={setPublicUsername}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Display name
                </span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Username
                </span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[13px] text-white/35">
                    @
                  </span>
                  <input
                    value={publicUsername}
                    onChange={(e) => setPublicUsername(e.target.value)}
                    className={cn(fieldClass, 'mt-0 pl-8')}
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={cn(fieldClass, 'appearance-none')}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#121218] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Location
                </span>
                <div className="relative mt-2">
                  <MapPin className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={cn(fieldClass, 'mt-0 pl-10')}
                    placeholder="City, Country"
                  />
                </div>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Website
                </span>
                <div className="relative mt-2">
                  <Globe className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className={cn(fieldClass, 'mt-0 pl-10')}
                    placeholder="https://"
                  />
                </div>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Cal.com booking link
                </span>
                <div className="relative mt-2">
                  <Calendar className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={bookingUrl}
                    onChange={(e) => setBookingUrl(e.target.value)}
                    className={cn(fieldClass, 'mt-0 pl-10')}
                    placeholder="https://cal.com/your-username/30min"
                  />
                </div>
                <p className="mt-1.5 text-[12px] text-white/40">
                  Fans and brands will book meetings from your public profile.
                  Create your link at{' '}
                  <a
                    href="https://cal.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-300 hover:underline"
                  >
                    cal.com
                  </a>
                  .
                </p>
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                Bio
              </span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.05] px-3.5 py-3 text-[14px] leading-relaxed text-white outline-none focus:border-fuchsia-400/40"
              />
            </label>
          </StudioGlassCard>

          {/* Social links */}
          <StudioGlassCard className="p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                  <Link2 className="size-3.5 text-fuchsia-300" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-white">
                    Social links
                  </h2>
                  <p className="mt-0.5 text-[13px] text-white/45">
                    Connected platforms on your profile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addLink}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-[12px] font-semibold text-white/70 hover:text-white"
              >
                <Plus className="size-3.5" />
                Add
              </button>
            </div>
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="grid gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-3 sm:grid-cols-[140px_1fr_auto]"
                >
                  <input
                    value={link.platform}
                    onChange={(e) =>
                      updateLink(link.id, 'platform', e.target.value)
                    }
                    className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-[13px] text-white outline-none"
                    placeholder="Platform"
                  />
                  <input
                    value={link.url}
                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                    className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-[13px] text-white outline-none"
                    placeholder="https://"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-white/45 hover:text-rose-300"
                    aria-label="Remove link"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </StudioGlassCard>

          {/* Custom link */}
          <StudioGlassCard className="p-5 sm:p-6">
            <SectionTitle
              title="Custom link"
              description="A featured button on your public page"
              icon={Link2}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Button label
                </span>
                <input
                  value={customLinkLabel}
                  onChange={(e) => setCustomLinkLabel(e.target.value)}
                  className={fieldClass}
                  placeholder="Shop my looks"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  URL
                </span>
                <input
                  value={customLinkUrl}
                  onChange={(e) => setCustomLinkUrl(e.target.value)}
                  className={fieldClass}
                  placeholder="https://"
                />
              </label>
            </div>
          </StudioGlassCard>

          {/* Subscription */}
          <StudioGlassCard className="p-5 sm:p-6">
            <SectionTitle
              title="Subscription settings"
              description="Membership pricing on your profile"
              icon={CreditCard}
            />
            <div className="space-y-3">
              <ToggleRow
                label="Enable subscriptions"
                description="Show subscribe CTA on your page"
                checked={subsEnabled}
                onChange={() => setSubsEnabled((v) => !v)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                    Monthly price (₹)
                  </span>
                  <input
                    value={monthlyPrice}
                    onChange={(e) =>
                      setMonthlyPrice(e.target.value.replace(/[^0-9]/g, ''))
                    }
                    disabled={!subsEnabled}
                    className={cn(fieldClass, !subsEnabled && 'opacity-45')}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                    Pay-per-post (₹)
                  </span>
                  <input
                    value={ppvPrice}
                    onChange={(e) =>
                      setPpvPrice(e.target.value.replace(/[^0-9]/g, ''))
                    }
                    disabled={!subsEnabled}
                    className={cn(fieldClass, !subsEnabled && 'opacity-45')}
                  />
                </label>
              </div>
              <p className="text-[12px] text-white/40">
                Manage full plans in{' '}
                <Link
                  href="/influencer/plans"
                  className="font-semibold text-fuchsia-300 hover:text-fuchsia-200"
                >
                  Plans
                </Link>
                .
              </p>
            </div>
          </StudioGlassCard>

          {/* Coffee */}
          <StudioGlassCard className="p-5 sm:p-6">
            <SectionTitle
              title="Buy Me a Coffee settings"
              description="Tip jar on your creator page"
              icon={Coffee}
            />
            <div className="space-y-4">
              <ToggleRow
                label="Enable donations"
                description="Fans can tip from your coffee page"
                checked={coffeeEnabled}
                onChange={() => setCoffeeEnabled((v) => !v)}
              />
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Button text
                </span>
                <input
                  value={coffeeButton}
                  onChange={(e) => setCoffeeButton(e.target.value)}
                  disabled={!coffeeEnabled}
                  className={cn(fieldClass, !coffeeEnabled && 'opacity-45')}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Suggested amounts (₹)
                </span>
                <input
                  value={coffeeAmounts}
                  onChange={(e) =>
                    setCoffeeAmounts(e.target.value.replace(/[^0-9,\s]/g, ''))
                  }
                  disabled={!coffeeEnabled}
                  className={cn(fieldClass, !coffeeEnabled && 'opacity-45')}
                  placeholder="99, 199, 499"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Thank you message
                </span>
                <textarea
                  value={coffeeThanks}
                  onChange={(e) => setCoffeeThanks(e.target.value)}
                  disabled={!coffeeEnabled}
                  rows={2}
                  className={cn(
                    'mt-2 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.05] px-3.5 py-3 text-[14px] leading-relaxed text-white outline-none focus:border-fuchsia-400/40',
                    !coffeeEnabled && 'opacity-45'
                  )}
                />
              </label>
              <Link
                href="/influencer/coffee"
                className="inline-flex text-[12px] font-semibold text-amber-200/90 hover:text-amber-100"
              >
                Open coffee dashboard →
              </Link>
            </div>
          </StudioGlassCard>

          {/* Theme */}
          <StudioGlassCard className="p-5 sm:p-6">
            <AppearanceControls
              appearance={appearance}
              onChange={setAppearance}
            />
          </StudioGlassCard>

          {/* SEO */}
          <StudioGlassCard className="p-5 sm:p-6">
            <SectionTitle
              title="SEO preview"
              description="How your page may appear in search"
              icon={Search}
            />
            <div className="space-y-4">
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Meta title
                </span>
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className={fieldClass}
                  maxLength={70}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium tracking-[0.08em] text-white/40 uppercase">
                  Meta description
                </span>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  maxLength={160}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/12 bg-white/[0.05] px-3.5 py-3 text-[14px] leading-relaxed text-white outline-none focus:border-fuchsia-400/40"
                />
              </label>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="truncate text-[13px] text-[#8ab4f8]">{seoUrl}</p>
                <p className="mt-1 truncate text-[18px] font-medium text-[#bdc1c6]">
                  {seoPreviewTitle}
                </p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#9aa0a6]">
                  {seoPreviewDesc}
                </p>
              </div>
            </div>
          </StudioGlassCard>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                Live preview
              </p>
              <Link
                href={`/@${publicUsername || claimedUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-fuchsia-300 hover:text-fuchsia-200"
              >
                Open
                <ExternalLink className="size-3" />
              </Link>
            </div>
            <ProfileThemePreview
              displayName={displayName}
              username={publicUsername}
              bio={bio}
              avatar={avatar}
              appearance={appearance}
              category={category}
              location={location}
              customLinkLabel={customLinkLabel}
              customLinkUrl={customLinkUrl}
              coffeeEnabled={coffeeEnabled}
              coffeeButtonText={coffeeButton}
              subscriptionEnabled={subsEnabled}
              subscriptionPrice={Number(monthlyPrice) || 0}
            />
            <StudioGlassCard className="p-4">
              <p className="text-[12px] font-semibold text-white">Profile URL</p>
              <p className="mt-1 break-all text-[12px] text-white/50">
                {publicProfileUrl(publicUsername)}
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-white/40">
                Changes save to your account. Cover and avatar upload to
                Cloudinary when you pick a file.
                {subsEnabled
                  ? ` · Subscribe from ${formatCurrency(Number(monthlyPrice) || 0)}/mo`
                  : ''}
                .
              </p>
            </StudioGlassCard>
            <StudioGlassCard className="overflow-hidden p-0">
              <div className="border-b border-white/8 px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase">
                  Search snippet
                </p>
              </div>
              <div className="bg-[#202124] p-4">
                <p className="truncate text-[12px] text-[#8ab4f8]">{seoUrl}</p>
                <p className="mt-1 line-clamp-1 text-[16px] font-medium text-[#bdc1c6]">
                  {seoPreviewTitle}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-[#9aa0a6]">
                  {seoPreviewDesc}
                </p>
              </div>
            </StudioGlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
