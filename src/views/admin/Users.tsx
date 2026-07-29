'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AdminFanUser } from '@/types/admin'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<AdminFanUser[]>('/admin/users?limit=100'),
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-white/70">Fans on the platform and who they subscribe to</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>{users.length} fans</CardDescription>
        </CardHeader>
        {isLoading ? <p className="text-white/55">Loading…</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-white/55">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Subs</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-3 font-medium">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="hover:underline"
                    >
                      {u.displayName}
                    </Link>
                  </td>
                  <td className="py-3 text-white/70">@{u.username}</td>
                  <td className="py-3 text-white/70">{u.email}</td>
                  <td className="py-3">{u.activeSubscriptionCount}</td>
                  <td className="py-3">
                    <Badge
                      variant={u.status === 'ACTIVE' ? 'success' : 'default'}
                    >
                      {u.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-white/55">
                    No users yet.
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
