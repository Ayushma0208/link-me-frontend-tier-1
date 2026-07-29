'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Users, DollarSign, CreditCard, Bot, UserRound } from 'lucide-react'
import { api } from '@/lib/api'
import type { AdminCreator, AdminPlatformStats, AdminRevenue } from '@/types/admin'
import { isAiCreatorEmail } from '@/types/admin'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { formatCurrency, formatFollowers } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

type RevenueSummary = {
  summary: {
    currency: string
    subscriptionRevenue: string
    exclusiveRevenue: string
    coffeeRevenue: string
    liveRevenue: string
    messageRevenue: string
    voiceCallRevenue: string
    videoCallRevenue: string
    totalRevenue: string
  }
  items: Array<
    AdminRevenue & {
      creator: {
        id: string
        username: string
        displayName: string
        avatarUrl: string | null
        email: string
        kind: 'ai' | 'human'
      }
    }
  >
}

export function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<AdminPlatformStats>('/admin/stats'),
  })

  const { data: creators = [] } = useQuery({
    queryKey: ['admin-creators', 'preview'],
    queryFn: () => api<AdminCreator[]>('/admin/creators?limit=20'),
  })

  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => api<RevenueSummary>('/admin/revenue'),
  })

  const statCards = [
    {
      label: 'AI Creators',
      value: (stats?.totalAiCreators ?? stats?.totalCreators)?.toLocaleString() ?? '—',
      icon: Bot,
    },
    {
      label: 'Human Creators',
      value: stats?.totalHumanCreators?.toLocaleString() ?? '—',
      icon: UserRound,
    },
    {
      label: 'Fans',
      value: stats?.totalUsers.toLocaleString() ?? '—',
      icon: Users,
    },
    {
      label: 'Revenue',
      value: revenue
        ? formatCurrency(Number(revenue.summary.totalRevenue))
        : stats
          ? formatCurrency(stats.totalRevenue)
          : '—',
      icon: DollarSign,
    },
    {
      label: 'Active Subscriptions',
      value: stats?.activeSubscriptions.toLocaleString() ?? '—',
      icon: CreditCard,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-white/70">Platform overview and creator revenue</p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/55">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/20">
                <stat.icon className="h-6 w-6 text-brand-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {revenue ? (
        <div className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card>
            <p className="text-sm text-white/55">Subscriptions</p>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(Number(revenue.summary.subscriptionRevenue))}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-white/55">Exclusive (PPV)</p>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(Number(revenue.summary.exclusiveRevenue))}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-white/55">Buy me a coffee</p>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(Number(revenue.summary.coffeeRevenue))}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-white/55">Paid messages</p>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(Number(revenue.summary.messageRevenue))}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-white/55">Voice calls</p>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(Number(revenue.summary.voiceCallRevenue))}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-white/55">Video calls</p>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(Number(revenue.summary.videoCallRevenue))}
            </p>
          </Card>
        </div>
      ) : null}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenue by creator</CardTitle>
          <CardDescription>
            Subscriptions, content, messages, and voice/video calls
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-white/55">
                <th className="pb-3 font-medium">Creator</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Subs</th>
                <th className="pb-3 font-medium">Exclusive</th>
                <th className="pb-3 font-medium">Coffee</th>
                <th className="pb-3 font-medium">Messages</th>
                <th className="pb-3 font-medium">Voice</th>
                <th className="pb-3 font-medium">Video</th>
                <th className="pb-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {(revenue?.items ?? []).map((row) => (
                <tr key={row.creatorProfileId} className="border-b border-border/50">
                  <td className="py-3">
                    <Link
                      href={`/admin/influencers/${row.creator.id}`}
                      className="font-medium hover:underline"
                    >
                      {row.creator.displayName}
                    </Link>
                    <span className="ml-2 text-white/70">@{row.creator.username}</span>
                    <Badge
                      variant={row.creator.kind === 'ai' ? 'brand' : 'default'}
                      className="ml-2"
                    >
                      {row.creator.kind === 'ai' ? 'AI' : 'Human'}
                    </Badge>
                  </td>
                  <td className="py-3 text-white/70">{row.creator.email}</td>
                  <td className="py-3">
                    {formatCurrency(Number(row.subscriptionRevenue))}
                  </td>
                  <td className="py-3">
                    {formatCurrency(Number(row.exclusiveRevenue))}
                  </td>
                  <td className="py-3">
                    {formatCurrency(Number(row.coffeeRevenue))}
                  </td>
                  <td className="py-3">
                    {formatCurrency(Number(row.messageRevenue))}
                  </td>
                  <td className="py-3">
                    {formatCurrency(Number(row.voiceCallRevenue))}
                  </td>
                  <td className="py-3">
                    {formatCurrency(Number(row.videoCallRevenue))}
                  </td>
                  <td className="py-3 font-medium">
                    {formatCurrency(Number(row.totalRevenue))}
                  </td>
                </tr>
              ))}
              {!revenue?.items.length ? (
                <tr>
                  <td colSpan={9} className="py-4 text-white/55">
                    No revenue yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Creators</CardTitle>
          <CardDescription>AI and human creators on the platform</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-white/55">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Followers</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((c) => {
                const ai = isAiCreatorEmail(c.user.email)
                return (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3 font-medium">
                      <Link href={`/admin/influencers/${c.id}`} className="hover:underline">
                        {c.user.displayName}
                      </Link>
                    </td>
                    <td className="py-3 text-white/70">@{c.user.username}</td>
                    <td className="py-3 text-white/70">{c.user.email}</td>
                    <td className="py-3">{formatFollowers(c.followerCount)}</td>
                    <td className="py-3">
                      <Badge variant={ai ? 'brand' : 'default'}>
                        {ai ? 'AI' : 'Human'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={c.isVerified ? 'success' : 'default'}>
                        {c.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
