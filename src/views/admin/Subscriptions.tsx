'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

type AdminSubscription = {
  id: string
  status: string
  currentPeriodEnd: string
  user: { username: string; displayName: string; email: string }
  plan: { name: string; price: string; currency: string; interval: string }
  creator: { id: string; username: string; displayName: string }
}

export function AdminSubscriptions() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => api<AdminSubscription[]>('/admin/subscriptions?limit=50'),
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted">Active fan subscriptions across AI creators</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active</CardTitle>
          <CardDescription>{items.length} subscriptions</CardDescription>
        </CardHeader>
        {isLoading ? <p className="text-muted">Loading…</p> : null}
        <div className="space-y-3">
          {items.map((sub) => (
            <div
              key={sub.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 px-3 py-3"
            >
              <div>
                <p className="font-medium">
                  {sub.user.displayName}{' '}
                  <span className="text-muted">→ {sub.creator.displayName}</span>
                </p>
                <p className="text-sm text-muted">
                  {sub.plan.name} · {formatCurrency(Number(sub.plan.price))}/
                  {sub.plan.interval.toLowerCase()}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="success">{sub.status}</Badge>
                <p className="mt-1 text-xs text-muted">
                  Until {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {!isLoading && items.length === 0 ? (
            <p className="text-muted">No active subscriptions</p>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
