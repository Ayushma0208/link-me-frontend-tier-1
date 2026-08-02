'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AdminKycApplication, AdminKycStatus } from '@/types/admin'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type StatusFilter = AdminKycStatus | 'ALL'

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'REVIEW_REQUIRED', label: 'Needs review' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ALL', label: 'All' },
]

function statusBadgeVariant(
  status: AdminKycStatus
): 'default' | 'success' | 'warning' | 'brand' {
  if (status === 'APPROVED') return 'success'
  if (status === 'REVIEW_REQUIRED') return 'warning'
  if (status === 'PROCESSING') return 'brand'
  return 'default'
}

function formatSubmittedAt(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export function AdminKycReview() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('REVIEW_REQUIRED')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-kyc', statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      return api<AdminKycApplication[]>(`/admin/kyc?${params}`)
    },
  })

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string
      action: 'approve' | 'reject'
      reason?: string
    }) =>
      api<{ status: AdminKycStatus }>(`/admin/kyc/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: () => {
      setActionError(null)
      setRejectingId(null)
      setRejectReason('')
      void queryClient.invalidateQueries({ queryKey: ['admin-kyc'] })
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : 'Review failed')
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">KYC review</h1>
        <p className="text-white/70">
          Review creator documents queued after automatic verification
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStatusFilter(filter.value)
              setExpandedId(null)
              setRejectingId(null)
            }}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === filter.value
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {actionError ? (
        <p className="mb-4 text-sm text-red-300">{actionError}</p>
      ) : null}

      <div className="grid gap-4">
        {isLoading ? <p className="text-white/55">Loading…</p> : null}
        {!isLoading && applications.length === 0 ? (
          <p className="text-white/55">No KYC applications in this filter.</p>
        ) : null}

        {applications.map((app) => {
          const open = expandedId === app.id
          const canDecide = app.status === 'REVIEW_REQUIRED'
          const busy =
            reviewMutation.isPending && reviewMutation.variables?.id === app.id

          return (
            <Card key={app.id} className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{app.user.displayName}</h3>
                    <Badge variant={statusBadgeVariant(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-white/70">
                    @{app.user.username} · {app.user.email}
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    Submitted {formatSubmittedAt(app.submittedAt)}
                    {app.matchScore != null
                      ? ` · Match score ${app.matchScore.toFixed(2)}`
                      : ''}
                  </p>
                  {app.rejectionReason ? (
                    <p className="mt-2 text-sm text-amber-200/80">
                      {app.rejectionReason}
                    </p>
                  ) : null}
                  {Array.isArray(app.verifyFlags) && app.verifyFlags.length ? (
                    <p className="mt-1 text-xs text-white/45">
                      Flags: {app.verifyFlags.join(', ')}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setExpandedId(open ? null : app.id)
                      setRejectingId(null)
                    }}
                  >
                    {open ? 'Hide docs' : 'View docs'}
                  </Button>
                  {canDecide ? (
                    <>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          reviewMutation.mutate({ id: app.id, action: 'approve' })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        onClick={() => {
                          setExpandedId(app.id)
                          setRejectingId(app.id)
                          setRejectReason('')
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              {open ? (
                <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                  {(
                    [
                      ['Aadhaar', app.documents.aadhaar.url],
                      ['PAN', app.documents.pan.url],
                      ['Selfie', app.documents.selfie.url],
                    ] as const
                  ).map(([label, url]) => (
                    <div key={label} className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-white/55">
                        {label}
                      </p>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-xl border border-white/10 bg-black/30"
                      >
                        <img
                          src={url}
                          alt={`${label} document`}
                          className="h-48 w-full object-contain"
                        />
                      </a>
                    </div>
                  ))}
                </div>
              ) : null}

              {rejectingId === app.id ? (
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <label className="block text-sm text-white/70">
                    Rejection reason
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Optional reason shown to the creator"
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/25"
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        reviewMutation.mutate({
                          id: app.id,
                          action: 'reject',
                          reason: rejectReason.trim() || undefined,
                        })
                      }
                    >
                      Confirm reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => {
                        setRejectingId(null)
                        setRejectReason('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
