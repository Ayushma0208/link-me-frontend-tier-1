'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarDays,
  Film,
  Grid3X3,
  ImagePlus,
  Lock,
  Pencil,
  Play,
  Plus,
  Radio,
  Settings2,
  Trash2,
  X,
} from 'lucide-react'
import { api } from '@/lib/api'
import { uploadMediaFile } from '@/lib/media-upload'
import {
  endLive,
  listCreatorLives,
  scheduleLive,
  startLive,
  startScheduledLive,
  type AgoraCreds,
  type LiveDto,
} from '@/lib/live'
import { LiveRoom } from '@/components/live/LiveRoom'
import type { AdminCreator, AdminRevenue } from '@/types/admin'
import { Button } from '@/components/ui/button'
import { ChatPlanEditor } from '@/components/chat/ChatPlanEditor'
import {
  draftsFromPlans,
  draftsToPayload,
  emptyChatPlanDrafts,
  type ChatPlanDraft,
} from '@/lib/chat-plans'
import { cn, formatCurrency, formatFollowers } from '@/lib/utils'

type ViewTab = 'posts' | 'reels' | 'stories' | 'edit'

type AdminPost = {
  id: string
  type: string
  status: string
  visibility: string
  title: string | null
  caption: string | null
  price: string | null
  createdAt: string
  media: Array<{ url: string | null; type: string; storageKey?: string | null }>
}

type AdminStory = {
  id: string
  mediaType: string
  mediaKey: string
  mediaUrl?: string | null
  thumbnailUrl?: string | null
  caption: string | null
  expiresAt: string
  createdAt: string
  expired: boolean
  active: boolean
}

type AdminHighlight = {
  id: string
  title: string
  coverKey: string | null
  storyCount: number
  stories: Array<{ id: string; mediaType: string; mediaKey: string }>
}

type AdminEvent = {
  id: string
  title: string
  location: string
  startsAt: string
  ticketUrl: string
}

function mediaSrc(keyOrUrl: string | null | undefined, kind: 'image' | 'video' = 'image') {
  if (!keyOrUrl) return null
  if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
    return keyOrUrl
  }
  // Fallback: build Cloudinary delivery URL from storage public_id
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dx196miia'
  const publicId = keyOrUrl.replace(/\.[a-z0-9]+$/i, '')
  return `https://res.cloudinary.com/${cloud}/${kind}/upload/${publicId}`
}

function storyThumb(story: AdminStory) {
  const kind = story.mediaType === 'VIDEO' ? 'video' : 'image'
  const thumb =
    mediaSrc(story.thumbnailUrl, 'image') ||
    (kind === 'video'
      ? null
      : mediaSrc(story.mediaUrl, 'image')) ||
    mediaSrc(story.mediaKey, kind === 'video' ? 'image' : kind)
  if (thumb) return thumb
  // Cloudinary first-frame poster when only a video URL exists
  const videoUrl =
    mediaSrc(story.mediaUrl, 'video') || mediaSrc(story.mediaKey, 'video')
  if (videoUrl?.includes('/video/upload/')) {
    return videoUrl
      .replace('/video/upload/', '/video/upload/so_0,f_jpg/')
      .replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, '.jpg$2')
  }
  return videoUrl
}

function AdminStoryTile({
  story,
  badge,
  onDelete,
}: {
  story: AdminStory
  badge: string
  onDelete: () => void
}) {
  const thumb = storyThumb(story)
  return (
    <div className="group relative aspect-[9/16] bg-white/5">
      {thumb ? (
        <img src={thumb} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-white/30">
          <Film className="size-6" />
        </div>
      )}
      {story.mediaType === 'VIDEO' && thumb ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-black/45 p-2 text-white">
            <Film className="size-4" />
          </span>
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="truncate text-[11px] text-white/80">
          {badge} · {story.caption || 'No caption'}
        </p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

function HighlightStoryPick({
  story,
  checked,
  onToggle,
}: {
  story: AdminStory
  checked: boolean
  onToggle: () => void
}) {
  const thumb = storyThumb(story)
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-white/5">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-white/10">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="size-full object-cover" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1 truncate text-white/80">
        {story.caption || story.mediaType} ·{' '}
        {story.active ? 'live' : 'archived'}
      </span>
    </label>
  )
}

function postThumb(post: AdminPost) {
  const m = post.media?.[0]
  if (!m) return null
  const kind = m.type === 'VIDEO' ? 'video' : 'image'
  return mediaSrc(m.url, kind) || mediaSrc(m.storageKey, kind) || null
}

export function AdminCreatorDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()
  const queryClient = useQueryClient()

  const [tab, setTab] = useState<ViewTab>('posts')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [storyOpen, setStoryOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [bio, setBio] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [messagePrice, setMessagePrice] = useState('49')
  const [voiceCallPrice, setVoiceCallPrice] = useState('99')
  const [videoCallPrice, setVideoCallPrice] = useState('149')
  const [chatPlanDrafts, setChatPlanDrafts] = useState<ChatPlanDraft[]>(
    emptyChatPlanDrafts()
  )
  const [coffeeEnabled, setCoffeeEnabled] = useState(true)
  const [coffeeText, setCoffeeText] = useState('Buy me a coffee')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [caption, setCaption] = useState('')
  const [postType, setPostType] = useState<'IMAGE' | 'REEL'>('IMAGE')
  const [visibility, setVisibility] = useState<'SUBSCRIBERS' | 'PPV' | 'PUBLIC'>(
    'PUBLIC'
  )
  const [ppvPrice, setPpvPrice] = useState('99')
  const [postFile, setPostFile] = useState<File | null>(null)
  const [postPreview, setPostPreview] = useState<string | null>(null)
  const postInputRef = useRef<HTMLInputElement>(null)

  const [storyCaption, setStoryCaption] = useState('')
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [storyPreview, setStoryPreview] = useState<string | null>(null)

  const [highlightTitle, setHighlightTitle] = useState('')
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([])

  const [eventType, setEventType] = useState<'TICKET' | 'LIVE'>('TICKET')
  const [eventTitle, setEventTitle] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [eventStartsAt, setEventStartsAt] = useState('')
  const [eventTicketUrl, setEventTicketUrl] = useState('')

  const [liveOpen, setLiveOpen] = useState(false)
  const [liveTitle, setLiveTitle] = useState('')
  const [liveDesc, setLiveDesc] = useState('')
  const [liveAccess, setLiveAccess] = useState<'FREE' | 'PAID'>('FREE')
  const [livePrice, setLivePrice] = useState('99')
  const [emojiPrice, setEmojiPrice] = useState('9')
  const [hostCreds, setHostCreds] = useState<AgoraCreds | null>(null)
  const [hostLive, setHostLive] = useState<LiveDto | null>(null)

  const { data: creator, isLoading } = useQuery({
    queryKey: ['admin-creator', id],
    queryFn: async () => {
      const res = await api<{ creator: AdminCreator }>(`/admin/creators/${id}`)
      return res.creator
    },
    enabled: Boolean(id),
  })

  const { data: revenue } = useQuery({
    queryKey: ['admin-creator-revenue', id],
    queryFn: async () => {
      const res = await api<{ revenue: AdminRevenue }>(
        `/admin/creators/${id}/revenue`
      )
      return res.revenue
    },
    enabled: Boolean(id),
  })

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-creator-posts', id],
    queryFn: () => api<AdminPost[]>(`/admin/creators/${id}/posts?limit=100`),
    enabled: Boolean(id),
  })

  const { data: stories = [] } = useQuery({
    queryKey: ['admin-creator-stories', id],
    queryFn: () => api<AdminStory[]>(`/admin/creators/${id}/stories`),
    enabled: Boolean(id),
  })

  const { data: highlights = [] } = useQuery({
    queryKey: ['admin-creator-highlights', id],
    queryFn: () => api<AdminHighlight[]>(`/admin/creators/${id}/highlights`),
    enabled: Boolean(id),
  })

  const { data: events = [] } = useQuery({
    queryKey: ['admin-creator-events', id],
    queryFn: () => api<AdminEvent[]>(`/admin/creators/${id}/events`),
    enabled: Boolean(id),
  })

  const { data: lives = [] } = useQuery({
    queryKey: ['admin-creator-lives', id],
    queryFn: () => listCreatorLives(id),
    enabled: Boolean(id),
  })

  const activeLive = useMemo(
    () => lives.find((l) => l.status === 'LIVE') ?? null,
    [lives]
  )

  const scheduledLives = useMemo(
    () =>
      lives
        .filter((l) => l.status === 'SCHEDULED')
        .sort(
          (a, b) =>
            new Date(a.scheduledAt ?? a.createdAt).getTime() -
            new Date(b.scheduledAt ?? b.createdAt).getTime()
        ),
    [lives]
  )

  const imagePosts = useMemo(
    () => posts.filter((p) => p.type === 'IMAGE' || p.type === 'CAROUSEL'),
    [posts]
  )
  const reelPosts = useMemo(
    () => posts.filter((p) => p.type === 'REEL' || p.type === 'VIDEO'),
    [posts]
  )
  const gridPosts = tab === 'reels' ? reelPosts : imagePosts.length ? imagePosts : posts
  const activeStories = useMemo(() => stories.filter((s) => s.active), [stories])
  const archivedStories = useMemo(
    () => stories.filter((s) => s.expired),
    [stories]
  )

  function flash(ok: string) {
    setMessage(ok)
    setError('')
  }

  function openEdit() {
    if (!creator) return
    setDisplayName(creator.user.displayName)
    setBio(creator.bio || '')
    setMonthlyPrice(creator.monthlyPlan?.price || '499')
    setMessagePrice(creator.chatPricePerMessage || '49')
    setVoiceCallPrice(creator.voiceCallPrice || '99')
    setVideoCallPrice(creator.videoCallPrice || '149')
    setChatPlanDrafts(
      draftsFromPlans(
        creator.chatPlans,
        Number(creator.chatPricePerMessage) || 49
      )
    )
    setCoffeeEnabled(creator.isCoffeeEnabled)
    setCoffeeText(creator.coffeeButtonText || 'Buy me a coffee')
    setAvatarFile(null)
    setEditOpen(true)
  }

  function pickPostFile(file: File | null) {
    if (postPreview) URL.revokeObjectURL(postPreview)
    setPostFile(file)
    setPostPreview(file ? URL.createObjectURL(file) : null)
    if (file?.type.startsWith('video/')) setPostType('REEL')
    else if (file) setPostType('IMAGE')
  }

  function pickStoryFile(file: File | null) {
    if (storyPreview) URL.revokeObjectURL(storyPreview)
    setStoryFile(file)
    setStoryPreview(file ? URL.createObjectURL(file) : null)
  }

  const createPost = useMutation({
    mutationFn: async () => {
      if (!postFile) throw new Error('Choose a photo or video')
      const isReel = postType === 'REEL'
      const uploaded = await uploadMediaFile({
        file: postFile,
        purpose: isReel ? 'REEL' : 'POST',
        type: isReel ? 'VIDEO' : 'IMAGE',
      })
      return api(`/admin/creators/${id}/posts`, {
        method: 'POST',
        body: JSON.stringify({
          type: postType,
          caption: caption || null,
          visibility,
          price: visibility === 'PPV' ? Number(ppvPrice) || 0 : null,
          publish: true,
          media: [
            {
              type: isReel ? 'VIDEO' : 'IMAGE',
              storageKey:
                uploaded.asset.storageKey ||
                uploaded.url ||
                `upload/${Date.now()}`,
              url: uploaded.url,
            },
          ],
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-posts', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-creator', id] })
      setCaption('')
      pickPostFile(null)
      setComposeOpen(false)
      flash('Post published')
    },
    onError: (e: Error) => setError(e.message),
  })

  const deletePost = useMutation({
    mutationFn: (postId: string) =>
      api(`/admin/creators/${id}/posts/${postId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-posts', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-creator', id] })
    },
  })

  const createStory = useMutation({
    mutationFn: async () => {
      if (!storyFile) throw new Error('Choose a story file')
      const isVideo = storyFile.type.startsWith('video/')
      const uploaded = await uploadMediaFile({
        file: storyFile,
        purpose: 'STORY',
        type: isVideo ? 'VIDEO' : 'IMAGE',
      })
      return api(`/admin/creators/${id}/stories`, {
        method: 'POST',
        body: JSON.stringify({
          mediaType: isVideo ? 'VIDEO' : 'IMAGE',
          mediaKey:
            uploaded.asset.storageKey || uploaded.url || `story/${Date.now()}`,
          mediaUrl: uploaded.url,
          caption: storyCaption || null,
          expiresInHours: 24,
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-stories', id] })
      setStoryCaption('')
      pickStoryFile(null)
      setStoryOpen(false)
      flash('Story live for 24h on avatar ring — not added to Highlights')
    },
    onError: (e: Error) => setError(e.message),
  })

  const deleteStory = useMutation({
    mutationFn: (storyId: string) =>
      api(`/admin/creators/${id}/stories/${storyId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-stories', id] })
    },
  })

  const createHighlight = useMutation({
    mutationFn: () =>
      api(`/admin/creators/${id}/highlights`, {
        method: 'POST',
        body: JSON.stringify({
          title: highlightTitle.trim(),
          storyIds: selectedStoryIds,
          coverKey: selectedStoryIds[0]
            ? stories.find((s) => s.id === selectedStoryIds[0])?.mediaKey
            : null,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-creator-highlights', id],
      })
      setHighlightTitle('')
      setSelectedStoryIds([])
      setHighlightOpen(false)
      flash('Highlight added')
    },
    onError: (e: Error) => setError(e.message),
  })

  const deleteHighlight = useMutation({
    mutationFn: (highlightId: string) =>
      api(`/admin/creators/${id}/highlights/${highlightId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-creator-highlights', id],
      })
    },
  })

  const createEvent = useMutation({
    mutationFn: () => {
      if (!eventTitle.trim() || !eventLocation.trim() || !eventTicketUrl.trim()) {
        throw new Error('Title, location, and ticket link are required')
      }
      if (!eventStartsAt) throw new Error('Pick a date & time')
      return api(`/admin/creators/${id}/events`, {
        method: 'POST',
        body: JSON.stringify({
          title: eventTitle.trim(),
          location: eventLocation.trim(),
          startsAt: new Date(eventStartsAt).toISOString(),
          ticketUrl: eventTicketUrl.trim(),
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-events', id] })
      setEventTitle('')
      setEventLocation('')
      setEventStartsAt('')
      setEventTicketUrl('')
      setEventOpen(false)
      flash('Event added — fans see tickets on the profile')
    },
    onError: (e: Error) => setError(e.message),
  })

  const deleteEvent = useMutation({
    mutationFn: (eventId: string) =>
      api(`/admin/creators/${id}/events/${eventId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-events', id] })
      flash('Event removed')
    },
  })

  const scheduleLiveMutation = useMutation({
    mutationFn: () => {
      if (!liveTitle.trim()) throw new Error('Add a title for the live')
      if (!eventStartsAt) throw new Error('Pick a date & time')
      const when = new Date(eventStartsAt)
      if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
        throw new Error('Pick a future date & time')
      }
      const price = Number(livePrice)
      if (liveAccess === 'PAID' && (!Number.isFinite(price) || price <= 0)) {
        throw new Error('Enter a valid price for a paid live')
      }
      const tip = Number(emojiPrice)
      if (!Number.isFinite(tip) || tip <= 0) {
        throw new Error('Enter a valid emoji price')
      }
      return scheduleLive(id, {
        title: liveTitle.trim(),
        description: liveDesc.trim() || null,
        accessType: liveAccess,
        scheduledAt: when.toISOString(),
        emojiPrice: tip,
        ...(liveAccess === 'PAID' ? { price } : {}),
      })
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-lives', id] })
      setEventOpen(false)
      flash(`Live scheduled — ${res.notified} subscriber(s) notified`)
    },
    onError: (e: Error) => setError(e.message),
  })

  const startScheduled = useMutation({
    mutationFn: (liveId: string) => startScheduledLive(liveId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-lives', id] })
      setHostCreds(res.agora)
      setHostLive(res.live)
      flash(`Live started — ${res.notified} subscriber(s) notified`)
    },
    onError: (e: Error) => setError(e.message),
  })

  const goLive = useMutation({
    mutationFn: () => {
      if (!liveTitle.trim()) throw new Error('Add a title for the live')
      const price = Number(livePrice)
      if (liveAccess === 'PAID' && (!Number.isFinite(price) || price <= 0)) {
        throw new Error('Enter a valid price for a paid live')
      }
      const tip = Number(emojiPrice)
      if (!Number.isFinite(tip) || tip <= 0) {
        throw new Error('Enter a valid emoji price')
      }
      return startLive(id, {
        title: liveTitle.trim(),
        description: liveDesc.trim() || null,
        accessType: liveAccess,
        emojiPrice: tip,
        ...(liveAccess === 'PAID' ? { price } : {}),
      })
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-lives', id] })
      setLiveOpen(false)
      setHostCreds(res.agora)
      setHostLive(res.live)
      flash(`Live started — ${res.notified} subscriber(s) notified`)
    },
    onError: (e: Error) => setError(e.message),
  })

  const stopLive = useMutation({
    mutationFn: (liveId: string) => endLive(liveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator-lives', id] })
      setHostCreds(null)
      setHostLive(null)
      flash('Live ended')
    },
    onError: (e: Error) => setError(e.message),
  })

  const saveProfile = useMutation({
    mutationFn: async () => {
      let avatarUrl: string | undefined
      if (avatarFile) {
        const uploaded = await uploadMediaFile({
          file: avatarFile,
          purpose: 'AVATAR',
          type: 'IMAGE',
        })
        avatarUrl = uploaded.url || undefined
      }
      const perItem = chatPlanDrafts.find((d) => d.mode === 'PER_ITEM')
      const legacyMessage =
        Number(perItem?.textPrice) || Number(messagePrice) || 0
      await api(`/admin/creators/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio,
          chatPricePerMessage: legacyMessage,
          voiceCallPrice: Number(voiceCallPrice) || 0,
          videoCallPrice: Number(videoCallPrice) || 0,
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        }),
      })
      await api(`/admin/creators/${id}/plan`, {
        method: 'PUT',
        body: JSON.stringify({ price: Number(monthlyPrice) || 0 }),
      })
      await api(`/admin/creators/${id}/coffee`, {
        method: 'PUT',
        body: JSON.stringify({
          isCoffeeEnabled: coffeeEnabled,
          coffeeButtonText: coffeeText,
        }),
      })
      await api(`/admin/creators/${id}/chat-plans`, {
        method: 'PUT',
        body: JSON.stringify(draftsToPayload(chatPlanDrafts)),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creator', id] })
      setEditOpen(false)
      flash('Profile updated')
    },
    onError: (e: Error) => setError(e.message),
  })

  const removeCreator = useMutation({
    mutationFn: () => api(`/admin/creators/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creators'] })
      router.push('/admin/influencers')
    },
  })

  if (isLoading || !creator) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/40">
        Loading profile…
      </div>
    )
  }

  const avatar =
    creator.user.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.user.username}`
  const cover =
    creator.coverImageUrl ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/influencers"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
        >
          <ArrowLeft className="size-4" /> AI Creators
        </Link>
        <div className="flex gap-2">
          <Link href={`/${creator.user.username}`}>
            <Button variant="outline" size="sm">
              Public view
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Remove this AI creator?')) removeCreator.mutate()
            }}
          >
            Remove
          </Button>
        </div>
      </div>

      {message ? (
        <p className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {/* Instagram-like profile card */}
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0c12]">
        <div className="relative h-36 sm:h-44">
          <img src={cover} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-transparent to-black/20" />
        </div>

        <div className="relative px-4 pb-5 sm:px-6">
          <div className="-mt-12 flex items-end justify-between gap-3">
            <button
              type="button"
              onClick={() => setStoryOpen(true)}
              className={cn(
                'relative rounded-full p-[3px]',
                activeStories.length
                  ? 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-fuchsia-600'
                  : 'bg-white/15'
              )}
              title="Add 24h story (not a highlight)"
            >
              <img
                src={avatar}
                alt=""
                className="size-[86px] rounded-full border-[3px] border-[#0c0c12] object-cover sm:size-24"
              />
              <span className="absolute right-0 bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-[#0c0c12] bg-sky-500 text-white">
                <Plus className="size-4" strokeWidth={2.5} />
              </span>
            </button>

            <div className="mb-1 flex gap-2">
              <Button size="sm" onClick={() => setComposeOpen(true)}>
                <ImagePlus className="size-4" />
                New post
              </Button>
              <Button size="sm" variant="outline" onClick={openEdit}>
                <Pencil className="size-3.5" />
                Edit profile
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {creator.user.displayName}
            </h1>
            <p className="text-sm text-white/45">@{creator.user.username}</p>
            {creator.bio ? (
              <p className="mt-2 max-w-xl whitespace-pre-wrap text-[14px] leading-relaxed text-white/70">
                {creator.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/35">No bio yet — edit profile</p>
            )}
          </div>

          {/* Counts like Instagram */}
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-2 py-3 text-center">
            <div>
              <p className="text-lg font-bold text-white">{posts.length}</p>
              <p className="text-[11px] tracking-wide text-white/40 uppercase">
                Posts
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {formatFollowers(creator.followerCount)}
              </p>
              <p className="text-[11px] tracking-wide text-white/40 uppercase">
                Followers
              </p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                {creator.subscriberCount}
              </p>
              <p className="text-[11px] tracking-wide text-white/40 uppercase">
                Subs
              </p>
            </div>
          </div>

          {/* Earnings */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {(
              [
                ['Total', revenue?.totalRevenue],
                ['Subs', revenue?.subscriptionRevenue],
                ['Exclusive', revenue?.exclusiveRevenue],
                ['Coffee', revenue?.coffeeRevenue],
                ['Live', revenue?.liveRevenue],
                ['Messages', revenue?.messageRevenue],
                ['Voice calls', revenue?.voiceCallRevenue],
                ['Video calls', revenue?.videoCallRevenue],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-transparent px-3 py-2.5"
              >
                <p className="text-[10px] tracking-wide text-white/40 uppercase">
                  {label}
                </p>
                <p className="mt-0.5 text-[15px] font-semibold text-white">
                  {value != null ? formatCurrency(Number(value)) : '₹0.00'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights row — permanent collections only (not 24h stories) */}
        <div className="border-t border-white/8 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-white/40 uppercase">
              Highlights
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedStoryIds([])
                setHighlightTitle('')
                setHighlightOpen(true)
              }}
              className="text-[12px] font-medium text-sky-400 hover:text-sky-300"
            >
              + New highlight
            </button>
          </div>
          <p className="mt-1 text-[11px] text-white/35">
            Highlights are permanent. Add a 24h story from the avatar (+) or the
            Stories tab — it will not appear here until you pin it.
          </p>
          <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setSelectedStoryIds([])
                setHighlightTitle('')
                setHighlightOpen(true)
              }}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span className="flex size-14 items-center justify-center rounded-full border border-dashed border-white/25 text-white/50">
                <Plus className="size-5" />
              </span>
              <span className="truncate text-[11px] text-white/50">New</span>
            </button>
            {highlights.length === 0 ? (
              <p className="flex items-center text-[12px] text-white/30">
                No highlights yet — pin archived stories here.
              </p>
            ) : (
              highlights.map((h) => {
                const coverSrc =
                  mediaSrc(h.coverKey) ||
                  mediaSrc(h.stories[0]?.mediaKey) ||
                  avatar
                return (
                  <div
                    key={h.id}
                    className="group relative flex w-16 shrink-0 flex-col items-center gap-1.5"
                  >
                    <div className="size-14 overflow-hidden rounded-full border border-[#363636] p-[2px]">
                      <img
                        src={coverSrc}
                        alt=""
                        className="size-full rounded-full object-cover"
                      />
                    </div>
                    <span className="w-full truncate text-center text-[11px] text-white/60">
                      {h.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteHighlight.mutate(h.id)}
                      className="absolute -top-1 -right-1 hidden size-5 items-center justify-center rounded-full bg-black/80 text-white group-hover:flex"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Live — broadcast to subscribers with an SSE notification */}
        <div className="border-t border-white/8 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-white/40 uppercase">
              Live
            </p>
            {activeLive ? (
              <button
                type="button"
                onClick={() => stopLive.mutate(activeLive.id)}
                disabled={stopLive.isPending}
                className="text-[12px] font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50"
              >
                End live
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLiveTitle('')
                  setLiveDesc('')
                setLiveAccess('FREE')
                setLivePrice('99')
                setEmojiPrice('9')
                setLiveOpen(true)
                }}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-rose-400 hover:text-rose-300"
              >
                <Radio className="size-3.5" />
                Go live
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-white/35">
            Starts an in-app live and instantly notifies every active subscriber.
            Free lives are open to all subscribers; paid lives charge per viewer.
          </p>
          {activeLive ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                Live
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {activeLive.title}
                </p>
                <p className="text-[12px] text-white/50">
                  {activeLive.accessType === 'PAID'
                    ? `Paid · ${formatCurrency(activeLive.price ?? 0)}`
                    : 'Free for subscribers'}
                </p>
              </div>
              {hostCreds && hostLive?.id === activeLive.id ? (
                <button
                  type="button"
                  onClick={() => {
                    setHostCreds(hostCreds)
                    setHostLive(activeLive)
                  }}
                  className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#07070b]"
                >
                  Open studio
                </button>
              ) : null}
            </div>
          ) : null}
          {scheduledLives.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-semibold tracking-wide text-white/40 uppercase">
                Upcoming
              </p>
              {scheduledLives.map((live) => {
                const when = live.scheduledAt
                  ? new Date(live.scheduledAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : '—'
                return (
                  <div
                    key={live.id}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  >
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-rose-300/70" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {live.title}
                      </p>
                      <p className="truncate text-[12px] text-white/45">
                        {when} ·{' '}
                        {live.accessType === 'PAID'
                          ? `Paid · ${formatCurrency(live.price ?? 0)}`
                          : 'Free for subscribers'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startScheduled.mutate(live.id)}
                      disabled={
                        startScheduled.isPending || Boolean(activeLive)
                      }
                      className="rounded-full bg-rose-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-rose-500 disabled:opacity-50"
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      onClick={() => stopLive.mutate(live.id)}
                      disabled={stopLive.isPending}
                      className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-50"
                      aria-label="Cancel scheduled live"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

        {/* Events / ticket links — shown as ticket stubs on public profile */}
        <div className="border-t border-white/8 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold tracking-[0.14em] text-white/40 uppercase">
              Events & tickets
            </p>
            <button
              type="button"
              onClick={() => {
                setEventType('TICKET')
                setEventTitle('')
                setEventLocation('')
                setEventStartsAt('')
                setEventTicketUrl('')
                setLiveTitle('')
                setLiveDesc('')
                setLiveAccess('FREE')
                setLivePrice('99')
                setEmojiPrice('9')
                setEventOpen(true)
              }}
              className="text-[12px] font-medium text-sky-400 hover:text-sky-300"
            >
              + Add event
            </button>
          </div>
          <p className="mt-1 text-[11px] text-white/35">
            Concert, cricket, meetup — add a ticket link. Fans see ticket cards
            under All Events on the public profile.
          </p>
          <div className="mt-3 space-y-2">
            {events.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-sm text-white/35">
                No events yet
              </p>
            ) : (
              events.map((ev) => {
                const d = new Date(ev.startsAt)
                const when = Number.isNaN(d.getTime())
                  ? '—'
                  : d.toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                return (
                  <div
                    key={ev.id}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  >
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-white/40" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {ev.title}
                      </p>
                      <p className="truncate text-[12px] text-white/45">
                        {when} · {ev.location}
                      </p>
                      <a
                        href={ev.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 block truncate text-[11px] text-sky-400"
                      >
                        {ev.ticketUrl}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteEvent.mutate(ev.id)}
                      className="rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                      aria-label="Delete event"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Instagram tab bar */}
        <div className="flex border-t border-white/8">
          {(
            [
              { id: 'posts' as const, icon: Grid3X3, label: 'Posts' },
              { id: 'reels' as const, icon: Film, label: 'Reels' },
              { id: 'stories' as const, icon: Plus, label: 'Stories' },
              { id: 'edit' as const, icon: Settings2, label: 'Profile' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (t.id === 'edit') openEdit()
                else if (t.id === 'stories') setTab('stories')
                else setTab(t.id)
              }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-3 text-[12px] font-semibold tracking-wide uppercase',
                  (t.id === 'edit' ? false : tab === t.id)
                  ? 'border-t-2 border-white text-white'
                  : 'border-t-2 border-transparent text-white/35 hover:text-white'
              )}
            >
              <t.icon className="size-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'stories' ? (
          <div className="space-y-6 border-t border-white/8 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/50">
                {activeStories.length} live · {archivedStories.length} archived
              </p>
              <Button size="sm" onClick={() => setStoryOpen(true)}>
                Add story
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                  Live · 24h on profile
                </p>
              </div>
              {activeStories.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-white/35">
                  No live stories. Use the avatar (+) or Add story — fans see it
                  on the profile ring for 24 hours. It will not appear under
                  Highlights until you pin it from Archive.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-4">
                  {activeStories.map((s) => (
                    <AdminStoryTile
                      key={s.id}
                      story={s}
                      badge="Live"
                      onDelete={() => deleteStory.mutate(s.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                    Archive · permanent
                  </p>
                  <p className="mt-1 text-[11px] text-white/35">
                    After 24h, stories land here and stay. Select any into a
                    highlight for the public profile.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={archivedStories.length === 0}
                  onClick={() => {
                    setSelectedStoryIds(archivedStories.map((s) => s.id).slice(0, 1))
                    setHighlightOpen(true)
                  }}
                >
                  + Highlight
                </Button>
              </div>
              {archivedStories.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-white/35">
                  Archive is empty. Expired stories appear here automatically.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-4">
                  {archivedStories.map((s) => (
                    <AdminStoryTile
                      key={s.id}
                      story={s}
                      badge="Archive"
                      onDelete={() => deleteStory.mutate(s.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-white/8">
            {gridPosts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full border border-white/15">
                  <ImagePlus className="size-7 text-white/40" />
                </div>
                <p className="text-lg font-semibold text-white">Share photos</p>
                <p className="max-w-xs text-sm text-white/40">
                  When you post as this creator, photos and reels show up here —
                  like your Instagram grid.
                </p>
                <Button onClick={() => setComposeOpen(true)}>
                  Upload first post
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {gridPosts.map((post) => {
                  const thumb = postThumb(post)
                  const locked =
                    post.visibility === 'SUBSCRIBERS' || post.visibility === 'PPV'
                  return (
                    <div
                      key={post.id}
                      className="group relative aspect-square bg-white/5"
                    >
                      {thumb ? (
                        post.type === 'REEL' || post.type === 'VIDEO' ? (
                          <video
                            src={thumb}
                            className="size-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={thumb}
                            alt=""
                            className="size-full object-cover"
                          />
                        )
                      ) : (
                        <div className="flex size-full items-center justify-center text-white/25">
                          {post.type === 'REEL' || post.type === 'VIDEO' ? (
                            <Film className="size-8" />
                          ) : (
                            <ImagePlus className="size-8" />
                          )}
                        </div>
                      )}
                      {(post.type === 'REEL' || post.type === 'VIDEO') && (
                        <Play className="absolute top-2 right-2 size-4 fill-white text-white drop-shadow" />
                      )}
                      {locked ? (
                        <Lock className="absolute top-2 left-2 size-3.5 text-white drop-shadow" />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this post?')) {
                              deletePost.mutate(post.id)
                            }
                          }}
                          className="rounded-full bg-white/15 p-2 text-white hover:bg-red-500/80"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compose modal — Instagram create feel */}
      {composeOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setComposeOpen(false)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border border-white/12 bg-[#121218] shadow-2xl sm:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <button
                type="button"
                onClick={() => setComposeOpen(false)}
                className="text-sm text-white/50"
              >
                Cancel
              </button>
              <p className="text-sm font-semibold text-white">Create new post</p>
              <button
                type="button"
                disabled={!postFile || createPost.isPending}
                onClick={() => createPost.mutate()}
                className="text-sm font-semibold text-sky-400 disabled:text-white/25"
              >
                {createPost.isPending ? 'Sharing…' : 'Share'}
              </button>
            </div>

            <div className="grid min-h-[360px] sm:grid-cols-2">
              <button
                type="button"
                onClick={() => postInputRef.current?.click()}
                className="relative flex min-h-[280px] items-center justify-center bg-black/40"
              >
                {postPreview ? (
                  postType === 'REEL' ? (
                    <video
                      src={postPreview}
                      className="max-h-[420px] w-full object-contain"
                      controls
                    />
                  ) : (
                    <img
                      src={postPreview}
                      alt=""
                      className="max-h-[420px] w-full object-contain"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <ImagePlus className="size-10" />
                    <p className="text-sm">Tap to select photo or video</p>
                  </div>
                )}
                <input
                  ref={postInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => pickPostFile(e.target.files?.[0] ?? null)}
                />
              </button>

              <div className="space-y-4 border-t border-white/8 p-4 sm:border-t-0 sm:border-l">
                <div className="flex items-center gap-2">
                  <img src={avatar} alt="" className="size-8 rounded-full" />
                  <span className="text-sm font-semibold text-white">
                    {creator.user.username}
                  </span>
                </div>
                <textarea
                  className="h-28 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  placeholder="Write a caption…"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <div className="space-y-2 border-t border-white/8 pt-3">
                  <p className="text-[11px] tracking-wide text-white/40 uppercase">
                    Type
                  </p>
                  <div className="flex gap-2">
                    {(
                      [
                        ['IMAGE', 'Photo'],
                        ['REEL', 'Reel / Video'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPostType(value)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium',
                          postType === value
                            ? 'bg-white text-black'
                            : 'bg-white/8 text-white/60'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] tracking-wide text-white/40 uppercase">
                    Audience
                  </p>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    value={visibility}
                    onChange={(e) =>
                      setVisibility(
                        e.target.value as 'SUBSCRIBERS' | 'PPV' | 'PUBLIC'
                      )
                    }
                  >
                    <option value="PUBLIC">Everyone (free posts)</option>
                    <option value="SUBSCRIBERS">Monthly subscribers only</option>
                    <option value="PPV">Exclusive — pay per unlock</option>
                  </select>
                  {visibility === 'PPV' ? (
                    <input
                      type="number"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                      value={ppvPrice}
                      onChange={(e) => setPpvPrice(e.target.value)}
                      placeholder="Unlock price (INR)"
                    />
                  ) : null}
                  <p className="text-[11px] text-white/35">
                    Exclusive stays locked for everyone (including subscribers)
                    until they pay the unlock price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Story modal */}
      {storyOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setStoryOpen(false)}
            aria-label="Close"
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[28px] border border-white/12 bg-[#121218] sm:rounded-[28px]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <button
                type="button"
                className="text-sm text-white/50"
                onClick={() => setStoryOpen(false)}
              >
                Cancel
              </button>
              <p className="text-sm font-semibold">Add to story</p>
              <button
                type="button"
                disabled={!storyFile || createStory.isPending}
                onClick={() => createStory.mutate()}
                className="text-sm font-semibold text-sky-400 disabled:text-white/25"
              >
                Share
              </button>
            </div>
            <div className="space-y-4 p-4">
              <label className="flex aspect-[9/16] max-h-[360px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/30">
                {storyPreview ? (
                  storyFile?.type.startsWith('video/') ? (
                    <video
                      src={storyPreview}
                      className="size-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={storyPreview}
                      alt=""
                      className="size-full object-cover"
                    />
                  )
                ) : (
                  <div className="text-center text-white/40">
                    <Plus className="mx-auto size-8" />
                    <p className="mt-2 text-sm">Photo or video · 24 hours</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => pickStoryFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                placeholder="Caption (optional)"
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Highlight modal — pick from archive (or live) */}
      {highlightOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setHighlightOpen(false)}
            aria-label="Close"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-[28px] border border-white/12 bg-[#121218] p-4 sm:rounded-[28px]">
            <h2 className="text-lg font-semibold text-white">New highlight</h2>
            <p className="mt-1 text-[12px] text-white/40">
              Choose archived stories (or still-live ones). Title can be text or an
              emoji like 🗽.
            </p>
            <input
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
              placeholder="Title or emoji (🗽 Travel…)"
              value={highlightTitle}
              onChange={(e) => setHighlightTitle(e.target.value)}
            />
            <div className="mt-3 max-h-56 space-y-3 overflow-y-auto">
              {stories.length === 0 ? (
                <p className="text-sm text-white/40">Upload stories first.</p>
              ) : (
                <>
                  {archivedStories.length > 0 ? (
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-white/35 uppercase">
                        Archive
                      </p>
                      {archivedStories.map((s) => (
                        <HighlightStoryPick
                          key={s.id}
                          story={s}
                          checked={selectedStoryIds.includes(s.id)}
                          onToggle={() =>
                            setSelectedStoryIds((ids) =>
                              ids.includes(s.id)
                                ? ids.filter((x) => x !== s.id)
                                : [...ids, s.id]
                            )
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                  {activeStories.length > 0 ? (
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-white/35 uppercase">
                        Still live (optional)
                      </p>
                      {activeStories.map((s) => (
                        <HighlightStoryPick
                          key={s.id}
                          story={s}
                          checked={selectedStoryIds.includes(s.id)}
                          onToggle={() =>
                            setSelectedStoryIds((ids) =>
                              ids.includes(s.id)
                                ? ids.filter((x) => x !== s.id)
                                : [...ids, s.id]
                            )
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setHighlightOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={
                  !highlightTitle.trim() ||
                  selectedStoryIds.length === 0 ||
                  createHighlight.isPending
                }
                onClick={() => createHighlight.mutate()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit profile modal */}
      {editOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setEditOpen(false)}
            aria-label="Close"
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/12 bg-[#121218] p-5 sm:rounded-[28px]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit profile</h2>
              <button type="button" onClick={() => setEditOpen(false)}>
                <X className="size-5 text-white/50" />
              </button>
            </div>
            <div className="mt-5 flex flex-col items-center gap-2">
              <img
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : avatar
                }
                alt=""
                className="size-24 rounded-full object-cover"
              />
              <label className="cursor-pointer text-sm font-semibold text-sky-400">
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div className="mt-5 space-y-3">
              <label className="block text-sm">
                <span className="text-white/40">Name</span>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-white/40">Bio</span>
                <textarea
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-white/40">Monthly price (INR)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                />
              </label>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-sm font-semibold text-white">Chat billing plans</p>
                <p className="mt-1 text-[12px] text-white/40">
                  Configure package, per-minute, and per-message chat pricing.
                </p>
                <ChatPlanEditor
                  className="mt-3"
                  drafts={chatPlanDrafts}
                  onChange={setChatPlanDrafts}
                />
              </div>
              <label className="block text-sm">
                <span className="text-white/40">Voice call price (INR / min)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  value={voiceCallPrice}
                  onChange={(e) => setVoiceCallPrice(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-white/40">Video call price (INR / min)</span>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  value={videoCallPrice}
                  onChange={(e) => setVideoCallPrice(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={coffeeEnabled}
                  onChange={(e) => setCoffeeEnabled(e.target.checked)}
                />
                Enable Buy me a coffee
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                value={coffeeText}
                onChange={(e) => setCoffeeText(e.target.value)}
              />
            </div>
            <Button
              className="mt-5 w-full"
              disabled={saveProfile.isPending}
              onClick={() => saveProfile.mutate()}
            >
              {saveProfile.isPending ? 'Saving…' : 'Done'}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Go Live modal */}
      {liveOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setLiveOpen(false)}
            aria-label="Close"
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[28px] border border-white/12 bg-[#121218] p-5 sm:rounded-[28px]">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Radio className="size-5 text-rose-400" />
                Go live
              </h2>
              <button
                type="button"
                onClick={() => setLiveOpen(false)}
                className="rounded-full p-2 text-white/50 hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-white/40">
              All active subscribers get a live notification the moment you start.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[12px] text-white/45">Title</label>
                <input
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  placeholder="Friday night Q&A"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                />
              </div>
              <div>
                <label className="text-[12px] text-white/45">
                  Description (optional)
                </label>
                <input
                  value={liveDesc}
                  onChange={(e) => setLiveDesc(e.target.value)}
                  placeholder="Come hang out live"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                />
              </div>
              <div>
                <label className="text-[12px] text-white/45">Access</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(['FREE', 'PAID'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setLiveAccess(opt)}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                        liveAccess === opt
                          ? 'border-white/30 bg-white/[0.08] text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
                      )}
                    >
                      {opt === 'FREE' ? 'Free for subs' : 'Paid'}
                    </button>
                  ))}
                </div>
              </div>
              {liveAccess === 'PAID' ? (
                <div>
                  <label className="text-[12px] text-white/45">
                    Price per viewer (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={livePrice}
                    onChange={(e) => setLivePrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/25"
                  />
                </div>
              ) : null}
              <div>
                <label className="text-[12px] text-white/45">
                  Emoji price (₹ per reaction)
                </label>
                <input
                  type="number"
                  min={1}
                  value={emojiPrice}
                  onChange={(e) => setEmojiPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/25"
                />
                <p className="mt-1 text-[11px] text-white/35">
                  Text comments stay free. Viewers pay this for each emoji.
                </p>
              </div>
            </div>
            <Button
              className="mt-5 w-full"
              disabled={goLive.isPending}
              onClick={() => goLive.mutate()}
            >
              {goLive.isPending ? 'Starting…' : 'Start live'}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Host live studio */}
      {hostCreds && hostLive ? (
        <LiveRoom
          creds={hostCreds}
          liveId={hostLive.id}
          emojiPrice={hostLive.emojiPrice}
          title={hostLive.title}
          subtitle={
            hostLive.accessType === 'PAID'
              ? `Paid live · ${formatCurrency(hostLive.price ?? 0)}`
              : 'Free for subscribers'
          }
          onLeave={() => {
            setHostCreds(null)
            setHostLive(null)
          }}
          onEnd={() => stopLive.mutate(hostLive.id)}
        />
      ) : null}

      {/* Event / ticket modal */}
      {eventOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setEventOpen(false)}
            aria-label="Close"
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[28px] border border-white/12 bg-[#121218] p-5 sm:rounded-[28px]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add event</h2>
              <button
                type="button"
                onClick={() => setEventOpen(false)}
                className="rounded-full p-2 text-white/50 hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-[13px] text-white/40">
              {eventType === 'TICKET'
                ? 'Shows as a ticket card on the creator profile. Tickets button opens your link.'
                : 'Schedules an in-app live. Subscribers get a heads-up now and a live notification when you start it.'}
            </p>
            <div className="mt-4">
              <label className="text-[12px] text-white/45">Type</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(['TICKET', 'LIVE'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEventType(opt)}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                      eventType === opt
                        ? 'border-white/30 bg-white/[0.08] text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
                    )}
                  >
                    {opt === 'TICKET' ? 'Ticket event' : 'Live'}
                  </button>
                ))}
              </div>
            </div>
            {eventType === 'TICKET' ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[12px] text-white/45">
                    Title (venue / match / meetup)
                  </label>
                  <input
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Beacon Theatre - 1:30AM"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-white/45">Location</label>
                  <input
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="New York, NY, United States"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-white/45">Date & time</label>
                  <input
                    type="datetime-local"
                    value={eventStartsAt}
                    onChange={(e) => setEventStartsAt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-white/45">Ticket link</label>
                  <input
                    value={eventTicketUrl}
                    onChange={(e) => setEventTicketUrl(e.target.value)}
                    placeholder="https://bookmyshow.com/..."
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-[12px] text-white/45">Title</label>
                  <input
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    placeholder="Friday night Q&A"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-white/45">
                    Description (optional)
                  </label>
                  <input
                    value={liveDesc}
                    onChange={(e) => setLiveDesc(e.target.value)}
                    placeholder="Come hang out live"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-white/45">Date & time</label>
                  <input
                    type="datetime-local"
                    value={eventStartsAt}
                    onChange={(e) => setEventStartsAt(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-white/45">Access</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(['FREE', 'PAID'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setLiveAccess(opt)}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                          liveAccess === opt
                            ? 'border-white/30 bg-white/[0.08] text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
                        )}
                      >
                        {opt === 'FREE' ? 'Free for subs' : 'Paid'}
                      </button>
                    ))}
                  </div>
                </div>
                {liveAccess === 'PAID' ? (
                  <div>
                    <label className="text-[12px] text-white/45">
                      Price per viewer (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={livePrice}
                      onChange={(e) => setLivePrice(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/25"
                    />
                  </div>
                ) : null}
                <div>
                  <label className="text-[12px] text-white/45">
                    Emoji price (₹ per reaction)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={emojiPrice}
                    onChange={(e) => setEmojiPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-white/25"
                  />
                  <p className="mt-1 text-[11px] text-white/35">
                    Text comments stay free. Viewers pay this for each emoji.
                  </p>
                </div>
              </div>
            )}
            <Button
              className="mt-5 w-full"
              disabled={
                eventType === 'TICKET'
                  ? createEvent.isPending
                  : scheduleLiveMutation.isPending
              }
              onClick={() =>
                eventType === 'TICKET'
                  ? createEvent.mutate()
                  : scheduleLiveMutation.mutate()
              }
            >
              {eventType === 'TICKET'
                ? createEvent.isPending
                  ? 'Saving…'
                  : 'Publish event'
                : scheduleLiveMutation.isPending
                  ? 'Scheduling…'
                  : 'Schedule live'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
