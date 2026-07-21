import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Image, Video, Lock, Upload } from 'lucide-react'
import { api } from '@/lib/api'
import { uploadMediaFile } from '@/lib/media-upload'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

type Tab = 'Stories' | 'Highlights' | 'Images' | 'Videos'

const typeIcons = { image: Image, video: Video, reel: Video }

export function InfluencerContent() {
  const [tab, setTab] = useState<Tab>('Images')
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const { data: posts = [] } = useQuery({
    queryKey: ['my-posts'],
    queryFn: () =>
      api<
        Array<{
          id: string
          type: string
          title: string
          perPostPrice: number | null
          sortOrder: number
        }>
      >('/content/posts/me'),
  })

  const createPost = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api('/content/posts', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
  })

  const createStory = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api('/content/stories', { method: 'POST', body: JSON.stringify(body) }),
  })

  async function handleUpload(
    file: File,
    type: 'image' | 'video' | 'reel',
    folder: 'posts' | 'stories',
  ) {
    setUploading(true)
    try {
      const mediaType =
        type === 'image' ? 'IMAGE' : type === 'video' || type === 'reel' ? 'VIDEO' : 'DOCUMENT'
      const purpose = folder === 'stories' ? 'STORY' : type === 'reel' ? 'REEL' : 'POST'

      const { asset, url } = await uploadMediaFile({
        file,
        purpose,
        type: mediaType,
      })

      const mediaKey = asset.storageKey ?? asset.id
      if (folder === 'stories') {
        await createStory.mutateAsync({ type, mediaKey, mediaUrl: url })
      } else {
        const title = file.name.replace(/\.[^.]+$/, '')
        await createPost.mutateAsync({
          type,
          title,
          mediaKey,
          mediaUrl: url,
          perPostPrice: type === 'image' ? 2.99 : 4.99,
        })
      }
    } finally {
      setUploading(false)
    }
  }

  const filtered = posts.filter((p) => {
    if (tab === 'Images') return p.type === 'image'
    if (tab === 'Videos') return p.type === 'video' || p.type === 'reel'
    return true
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content</h1>
          <p className="text-muted">Manage images, videos, stories, and highlights</p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500">
          <input
            type="file"
            className="hidden"
            accept={tab === 'Stories' ? 'image/*,video/*' : tab === 'Images' ? 'image/*' : 'video/*'}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const type =
                tab === 'Images' ? 'image' : tab === 'Stories' ? (file.type.startsWith('video') ? 'video' : 'image') : file.type.includes('short') ? 'reel' : 'video'
              handleUpload(file, type as 'image' | 'video' | 'reel', tab === 'Stories' ? 'stories' : 'posts')
            }}
          />
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Content'}
        </label>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {(['Stories', 'Highlights', 'Images', 'Videos'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              tab === t ? 'border-brand-500 bg-brand-600/10' : 'border-border hover:border-brand-500/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Highlights' ? (
        <p className="text-muted">Create highlights from your stories in the content manager.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const Icon = typeIcons[item.type as keyof typeof typeIcons] ?? Image
            return (
              <Card key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-overlay">
                    <Icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted">
                      {item.perPostPrice
                        ? `${formatCurrency(Number(item.perPostPrice))} per ${item.type}`
                        : `Free (post #${item.sortOrder})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.sortOrder > 2 && <Lock className="h-4 w-4 text-muted" />}
                  <Badge>{item.type}</Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
