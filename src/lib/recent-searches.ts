const STORAGE_KEY = 'linkme_recent_searches'
const MAX_RECENT = 8

export interface RecentSearch {
  id: string
  query: string
  at: number
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

export function getRecentSearches(): RecentSearch[] {
  if (!canUseStorage()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentSearch[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item.query === 'string')
      .slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

export function pushRecentSearch(query: string): RecentSearch[] {
  const cleaned = query.trim()
  if (!cleaned || !canUseStorage()) return getRecentSearches()

  const next: RecentSearch[] = [
    {
      id: `${Date.now()}-${cleaned.toLowerCase()}`,
      query: cleaned,
      at: Date.now(),
    },
    ...getRecentSearches().filter(
      (item) => item.query.toLowerCase() !== cleaned.toLowerCase()
    ),
  ].slice(0, MAX_RECENT)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota errors
  }
  return next
}

export function removeRecentSearch(id: string): RecentSearch[] {
  const next = getRecentSearches().filter((item) => item.id !== id)
  if (!canUseStorage()) return next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  return next
}

export function clearRecentSearches() {
  if (!canUseStorage()) return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
