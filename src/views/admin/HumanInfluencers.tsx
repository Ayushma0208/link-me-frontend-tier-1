'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdminCreator } from '@/types/admin'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { formatFollowers } from '@/lib/utils'

export function AdminHumanInfluencers() {
  const { data: creators = [], isLoading } = useQuery({
    queryKey: ['admin-creators', 'human'],
    queryFn: () => api<AdminCreator[]>('/admin/creators?kind=human&limit=100'),
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Human Influencers</h1>
        <p className="text-white/70">
          Real creators who registered and verified on the platform
        </p>
      </div>

      <div className="grid gap-4">
        {isLoading ? <p className="text-white/55">Loading…</p> : null}
        {!isLoading && creators.length === 0 ? (
          <p className="text-white/55">No human influencers yet.</p>
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
                  <Badge variant={inf.isVerified ? 'success' : 'default'}>
                    {inf.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-sm text-white/70">
                  @{inf.user.username} · {formatFollowers(inf.followerCount)}{' '}
                  followers · {inf.postCount} posts
                </p>
                <p className="text-sm text-white/70">{inf.user.email}</p>
                <p className="text-xs text-white/55">
                  Monthly:{' '}
                  {inf.monthlyPlan ? `₹${inf.monthlyPlan.price}` : '—'}
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
