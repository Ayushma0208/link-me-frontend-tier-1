import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { mockInfluencer } from '@/data/mock'
import {
  MaskedVideo,
  VIDEO_MASK_OPTIONS,
} from '@/components/video-masking'
import type { VideoMaskStyle } from '@/types'

export function InfluencerBioEditor() {
  const [maskStyle, setMaskStyle] = useState<VideoMaskStyle>(mockInfluencer.videoMaskStyle)
  const [bio, setBio] = useState(mockInfluencer.bio)
  const [name, setName] = useState(mockInfluencer.name)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bio Page Editor</h1>
        <p className="text-muted">Customize your public link-in-bio page</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Info</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-white outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-white outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Mask Style</CardTitle>
              <CardDescription>
                Choose how your profile video is displayed using CSS mask-image
              </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VIDEO_MASK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMaskStyle(opt.value)}
                  className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                    maskStyle === opt.value
                      ? 'border-brand-500 bg-brand-600/20 text-brand-300'
                      : 'border-border hover:border-brand-500/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Card>

          <Button className="w-full">Save Changes</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>How your bio page will look</CardDescription>
          </CardHeader>
          <div className="rounded-2xl bg-surface p-6">
            <div className="mb-4 flex justify-center">
              <MaskedVideo style={maskStyle} text={name.split(' ')[0].toUpperCase()} />
            </div>
            <h2 className="text-center text-xl font-bold">{name}</h2>
            <p className="mt-2 whitespace-pre-line text-center text-sm text-muted">{bio}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
