'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdminCreator } from '@/types/admin'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { formatFollowers } from '@/lib/utils'

export function AdminInfluencers() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('499')
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')

  const { data: creators = [], isLoading } = useQuery({
    queryKey: ['admin-creators'],
    queryFn: () => api<AdminCreator[]>('/admin/creators?limit=100'),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      api<{ creator: AdminCreator }>('/admin/creators', {
        method: 'POST',
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim() || undefined,
          bio: bio.trim(),
          monthlyPrice: Number(monthlyPrice) || 499,
          category: 'AI Creator',
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-creators'] })
      setOpen(false)
      setDisplayName('')
      setUsername('')
      setBio('')
      setMonthlyPrice('499')
      setError('')
    },
    onError: (err: Error) => setError(err.message),
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Creators</h1>
          <p className="text-muted">Admin-managed personas — create profiles and post as them</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add Creator
        </Button>
      </div>

      {open ? (
        <Card className="mb-6 space-y-4">
          <h2 className="text-lg font-semibold">New AI creator</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Display name</span>
              <input
                className="w-full rounded-lg border border-border bg-black/40 px-3 py-2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Sofia Reyes"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Username</span>
              <input
                className="w-full rounded-lg border border-border bg-black/40 px-3 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="sofia.r"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Monthly price (INR)</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-border bg-black/40 px-3 py-2"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-muted">Bio</span>
              <textarea
                className="w-full rounded-lg border border-border bg-black/40 px-3 py-2"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </label>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <div className="flex gap-2">
            <Button
              disabled={!displayName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {isLoading ? <p className="text-muted">Loading…</p> : null}
        {!isLoading && creators.length === 0 ? (
          <p className="text-muted">No creators yet. Add an AI creator to get started.</p>
        ) : null}
        {creators.map((inf) => (
          <Card key={inf.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  inf.user.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${inf.user.username}`
                }
                alt={inf.user.displayName}
                className="h-12 w-12 rounded-full bg-surface-overlay"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{inf.user.displayName}</h3>
                  {inf.isVerified ? <Badge variant="brand">Verified</Badge> : null}
                </div>
                <p className="text-sm text-muted">
                  @{inf.user.username} · {formatFollowers(inf.followerCount)} followers ·{' '}
                  {inf.postCount} posts
                </p>
                <p className="text-xs text-muted">
                  Monthly:{' '}
                  {inf.monthlyPlan
                    ? `₹${inf.monthlyPlan.price}`
                    : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/${inf.user.username}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  View
                </Button>
              </Link>
              <Link href={`/admin/influencers/${inf.id}`}>
                <Button size="sm">Manage</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!confirm(`Remove @${inf.user.username}?`)) return
                  try {
                    await api(`/admin/creators/${inf.id}`, { method: 'DELETE' })
                    queryClient.invalidateQueries({ queryKey: ['admin-creators'] })
                  } catch (e) {
                    alert(e instanceof Error ? e.message : 'Failed to remove')
                  }
                }}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
