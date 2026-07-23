'use client'

import { Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StreamStability =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'paused'
  | 'unknown'

export interface StreamHealthMetrics {
  /** Video send bitrate in bps */
  sendBitrateBps: number | null
  /** Sent FPS */
  sendFps: number | null
  sendWidth: number | null
  sendHeight: number | null
  /** Packet loss percent 0–100 */
  packetLossPercent: number | null
  /** Round-trip time ms */
  rttMs: number | null
  /** Agora uplinkNetworkQuality 0–6 (0 = unknown) */
  uplinkQuality: number | null
  stability: StreamStability
  paused?: boolean
}

interface StreamHealthDashboardProps {
  metrics: StreamHealthMetrics | null
  expanded: boolean
  onToggle: () => void
  className?: string
}

const STABILITY_LABEL: Record<StreamStability, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  paused: 'Paused',
  unknown: '—',
}

const STABILITY_DOT: Record<StreamStability, string> = {
  excellent: 'bg-emerald-400',
  good: 'bg-lime-400',
  fair: 'bg-amber-400',
  poor: 'bg-rose-400',
  paused: 'bg-white/40',
  unknown: 'bg-white/30',
}

const STABILITY_TEXT: Record<StreamStability, string> = {
  excellent: 'text-emerald-300',
  good: 'text-lime-300',
  fair: 'text-amber-300',
  poor: 'text-rose-300',
  paused: 'text-white/50',
  unknown: 'text-white/45',
}

export function formatBitrate(bps: number | null | undefined): string {
  if (bps == null || !Number.isFinite(bps) || bps < 0) return '—'
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`
  if (bps >= 1_000) return `${Math.round(bps / 1_000)} kbps`
  return `${Math.round(bps)} bps`
}

export function formatFps(fps: number | null | undefined): string {
  if (fps == null || !Number.isFinite(fps) || fps < 0) return '—'
  return `${Math.round(fps)} fps`
}

export function formatResolution(
  width: number | null | undefined,
  height: number | null | undefined
): string {
  if (!width || !height) return '—'
  return `${width}×${height}`
}

export function formatRtt(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return '—'
  return `${Math.round(ms)} ms`
}

export function formatPacketLoss(percent: number | null | undefined): string {
  if (percent == null || !Number.isFinite(percent) || percent < 0) return '—'
  return `${percent < 10 ? percent.toFixed(1) : Math.round(percent)}%`
}

/** Agora uplink 0 unknown, 1 best … 6 worst. */
export function uplinkLabel(score: number | null | undefined): string {
  if (score == null || score === 0) return 'Unknown'
  if (score <= 2) return 'Excellent'
  if (score === 3) return 'Good'
  if (score === 4) return 'Fair'
  if (score === 5) return 'Poor'
  return 'Bad'
}

export function stabilityFrom(input: {
  uplinkQuality: number | null
  packetLossPercent: number | null
  rttMs: number | null
  paused?: boolean
}): StreamStability {
  if (input.paused) return 'paused'

  const uplink = input.uplinkQuality
  const loss = input.packetLossPercent ?? 0
  const rtt = input.rttMs ?? 0

  if (uplink != null && uplink >= 5) return 'poor'
  if (loss >= 8 || rtt >= 300) return 'poor'
  if (uplink != null && uplink === 4) return 'fair'
  if (loss >= 4 || rtt >= 180) return 'fair'
  if (uplink != null && uplink === 3) return 'good'
  if (loss >= 2 || rtt >= 100) return 'good'
  if (uplink == null || uplink === 0) {
    if (rtt > 0 || loss > 0) return loss < 2 && rtt < 100 ? 'excellent' : 'good'
    return 'unknown'
  }
  if (uplink <= 2 && loss < 2 && rtt < 100) return 'excellent'
  return 'good'
}

export function StreamHealthDashboard({
  metrics,
  expanded,
  onToggle,
  className,
}: StreamHealthDashboardProps) {
  const stability = metrics?.stability ?? 'unknown'
  const paused = metrics?.paused || stability === 'paused'

  const summary = paused
    ? 'Paused'
    : [
        STABILITY_LABEL[stability],
        formatBitrate(metrics?.sendBitrateBps ?? null),
        formatFps(metrics?.sendFps ?? null),
      ].join(' · ')

  return (
    <div className={cn('relative z-40', className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label="Stream health"
        className={cn(
          'inline-flex max-w-[min(100vw-8rem,20rem)] items-center gap-2 rounded-full border-2 border-sky-400/80 bg-sky-500 px-3 py-2 text-left shadow-lg shadow-sky-900/40 transition hover:bg-sky-400',
          expanded && 'rounded-2xl rounded-b-none border-b-transparent'
        )}
      >
        <span
          className={cn(
            'size-2 shrink-0 rounded-full bg-black',
            !paused && stability !== 'unknown' && 'animate-pulse'
          )}
        />
        <Activity className="size-3.5 shrink-0 text-black" />
        <span className="min-w-0 truncate text-[11px] font-bold tracking-wide text-black">
          Health
          <span className="font-semibold text-black/70"> · {summary}</span>
        </span>
        {expanded ? (
          <ChevronUp className="size-3.5 shrink-0 text-black/55" />
        ) : (
          <ChevronDown className="size-3.5 shrink-0 text-black/55" />
        )}
      </button>

      {expanded ? (
        <div className="absolute left-0 top-full z-50 mt-0 w-[min(100vw-2rem,18rem)] rounded-2xl rounded-tl-none border border-sky-400/40 bg-black/90 px-3 py-3 shadow-xl shadow-black/50 backdrop-blur-md">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
            Stream health
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            <Metric
              label="Stability"
              value={STABILITY_LABEL[stability]}
              valueClassName={STABILITY_TEXT[stability]}
            />
            <Metric label="Uplink" value={uplinkLabel(metrics?.uplinkQuality)} />
            <Metric
              label="Bitrate"
              value={
                paused ? '—' : formatBitrate(metrics?.sendBitrateBps ?? null)
              }
            />
            <Metric
              label="FPS"
              value={paused ? '—' : formatFps(metrics?.sendFps ?? null)}
            />
            <Metric
              label="Resolution"
              value={
                paused
                  ? '—'
                  : formatResolution(
                      metrics?.sendWidth ?? null,
                      metrics?.sendHeight ?? null
                    )
              }
            />
            <Metric
              label="RTT"
              value={paused ? '—' : formatRtt(metrics?.rttMs ?? null)}
            />
            <Metric
              label="Packet loss"
              value={
                paused
                  ? '—'
                  : formatPacketLoss(metrics?.packetLossPercent ?? null)
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
        {label}
      </p>
      <p
        className={cn(
          'truncate text-[13px] font-semibold text-white/90',
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  )
}

