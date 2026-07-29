'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdminUserDetail } from '@/types/admin'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

export function AdminUserDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => api<AdminUserDetail>(`/admin/users/${id}`),
    enabled: Boolean(id),
  })

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/40">
        Loading user…
      </div>
    )
  }

  const { user, subscriptions } = data

  return (
    <div>
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Users
      </Link>

      <div className="mb-8 flex items-center gap-4">
        <img
          src={
            user.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
          }
          alt={user.displayName}
          className="h-16 w-16 rounded-full bg-surface-overlay"
        />
        <div>
          <h1 className="text-3xl font-bold">{user.displayName}</h1>
          <p className="text-white/70">@{user.username}</p>
          <p className="text-white/70">{user.email}</p>
          <Badge
            variant={user.status === 'ACTIVE' ? 'success' : 'default'}
            className="mt-2"
          >
            {user.status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscribed creators</CardTitle>
          <CardDescription>
            {subscriptions.length} active subscription
            {subscriptions.length === 1 ? '' : 's'}
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-white/55">
                <th className="pb-3 font-medium">Creator</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Until</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border/50">
                  <td className="py-3">
                    <Link
                      href={`/admin/influencers/${sub.creator.id}`}
                      className="font-medium hover:underline"
                    >
                      {sub.creator.displayName}
                    </Link>
                    <span className="ml-2 text-white/70">
                      @{sub.creator.username}
                    </span>
                  </td>
                  <td className="py-3 text-white/70">{sub.creator.email}</td>
                  <td className="py-3">
                    <Badge
                      variant={sub.creator.kind === 'ai' ? 'brand' : 'default'}
                    >
                      {sub.creator.kind === 'ai' ? 'AI' : 'Human'}
                    </Badge>
                  </td>
                  <td className="py-3">
                    {sub.plan.name} · {formatCurrency(Number(sub.plan.price))}
                  </td>
                  <td className="py-3 text-white/70">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-white/55">
                    Not subscribed to any creators.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
