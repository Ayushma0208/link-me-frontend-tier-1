'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Gift, TrendingDown, UserPlus, Users } from 'lucide-react'

import { StatCard } from '@/components/creator-studio/StatCard'
import { StudioGlassCard } from '@/components/creator-studio/StudioGlassCard'
import { StudioLineChart } from '@/components/creator-studio/StudioLineChart'
import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import {
  downsampleSeries,
  fetchLiveInsights,
} from '@/lib/studio-api'
import { formatCurrency, formatFollowers } from '@/lib/utils'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m`
  }
  return `${m}m ${s}s`
}

export function LiveInsightsStudio({ liveId }: { liveId: string }) {
  const query = useQuery({
    queryKey: ['creator-live-insights', liveId],
    queryFn: () => fetchLiveInsights(liveId),
  })

  const data = query.data
  const buckets = data?.buckets ?? []
  const sampled = downsampleSeries(buckets, 28)
  const viewerVals = sampled.map((b) => b.viewers ?? 0)
  const giftVals = sampled.map((b) => b.giftRevenue)
  const maxV = Math.max(...viewerVals, 1)
  const maxG = Math.max(...giftVals, 1)

  return (
    <div>
      <Link
        href="/influencer/live"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-white/80"
      >
        <ArrowLeft className="size-3.5" /> Back to Live Events
      </Link>

      <StudioPageHeader
        title={data?.live.title ?? 'Stream insights'}
        description="Post-stream heatmap: viewer drops vs gift and subscription spikes."
      />

      {query.isLoading ? (
        <p className="mb-6 text-sm text-white/45">Loading insights…</p>
      ) : null}
      {query.isError ? (
        <p className="mb-6 text-sm text-rose-300">
          Could not load insights for this stream.
        </p>
      ) : null}

      {data ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Duration"
              value={formatDuration(data.summary.durationSeconds)}
              icon={TrendingDown}
            />
            <StatCard
              label="Peak viewers"
              value={formatFollowers(data.summary.peakViewers)}
              icon={Users}
            />
            <StatCard
              label="Gift revenue"
              value={formatCurrency(data.summary.totalGiftRevenue)}
              icon={Gift}
            />
            <StatCard
              label="Subs during stream"
              value={formatFollowers(data.summary.subsDuringStream)}
              icon={UserPlus}
            />
          </div>

          {!data.summary.hasViewerSamples ? (
            <p className="mb-4 text-sm text-amber-200/80">
              Viewer curve unavailable for this stream (sampling starts on new
              lives). Gift and sub overlays still show below.
            </p>
          ) : null}

          <StudioLineChart
            title="Viewers & gift revenue"
            subtitle="Normalized to each series peak for correlation"
            labels={sampled.map((b) =>
              new Date(b.minuteAt).toISOString().slice(11, 16)
            )}
            series={[
              {
                key: 'viewers',
                label: 'Viewers',
                color: '#38bdf8',
                values: viewerVals.map((v) => (v / maxV) * 100),
              },
              {
                key: 'gifts',
                label: 'Gift revenue',
                color: '#e879f9',
                values: giftVals.map((v) => (v / maxG) * 100),
              },
            ]}
            formatValue={(v) => `${Math.round(v)}% of peak`}
            className="mb-6"
          />

          <StudioGlassCard glow="soft" className="p-5 sm:p-6">
            <h3 className="text-lg font-bold text-white">Key moments</h3>
            <p className="mt-1 text-[13px] text-white/45">
              Viewer drops (≥20%) and subscription spikes during the stream.
            </p>
            {data.markers.length === 0 ? (
              <p className="mt-4 text-sm text-white/45">
                No sharp drops or subscription spikes detected.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.markers.map((m) => (
                  <li
                    key={`${m.type}-${m.minuteAt}`}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/80"
                  >
                    <span
                      className={
                        m.type === 'viewer_drop'
                          ? 'text-rose-300'
                          : 'text-emerald-300'
                      }
                    >
                      {m.type === 'viewer_drop' ? 'Drop' : 'Spike'}
                    </span>
                    {' · '}
                    {m.label}
                  </li>
                ))}
              </ul>
            )}
          </StudioGlassCard>
        </>
      ) : null}
    </div>
  )
}
