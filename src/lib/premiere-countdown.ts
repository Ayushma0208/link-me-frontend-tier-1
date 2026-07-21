/** Shared premiere countdown helpers. */

export function formatPremiereWhen(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export interface CountdownParts {
  days: number
  hours: number
  mins: number
  secs: number
  totalMs: number
  done: boolean
}

export function getCountdownParts(iso: string | null): CountdownParts {
  if (!iso) {
    return { days: 0, hours: 0, mins: 0, secs: 0, totalMs: 0, done: true }
  }
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) {
    return { days: 0, hours: 0, mins: 0, secs: 0, totalMs: 0, done: true }
  }
  const totalMs = Math.max(0, target - Date.now())
  if (totalMs <= 0) {
    return { days: 0, hours: 0, mins: 0, secs: 0, totalMs: 0, done: true }
  }
  const totalSec = Math.floor(totalMs / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  return { days, hours, mins, secs, totalMs, done: false }
}

export function formatCountdownShort(iso: string | null): string {
  const p = getCountdownParts(iso)
  if (p.done) return 'Starting soon'
  if (p.days > 0) return `${p.days}d ${p.hours}h`
  if (p.hours > 0) return `${p.hours}h ${p.mins}m`
  if (p.mins > 0) return `${p.mins}m ${p.secs}s`
  return `${p.secs}s`
}
