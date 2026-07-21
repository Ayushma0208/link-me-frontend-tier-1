import {
  exploreCategories,
  feedCreators,
  feedPosts,
  feedCreatorsById,
  type ExploreCategory,
  type FeedCreator,
  type FeedPost,
} from '@/data/user-feed'

export type SearchResultKind = 'creator' | 'post' | 'tag' | 'category'

export interface CreatorSearchHit {
  kind: 'creator'
  id: string
  creator: FeedCreator
}

export interface PostSearchHit {
  kind: 'post'
  id: string
  post: FeedPost
  creator: FeedCreator
}

export interface TagSearchHit {
  kind: 'tag'
  id: string
  tag: string
  label: string
  count: number
}

export interface CategorySearchHit {
  kind: 'category'
  id: string
  category: ExploreCategory
  label: string
  count: number
}

export type SearchHit =
  | CreatorSearchHit
  | PostSearchHit
  | TagSearchHit
  | CategorySearchHit

export interface SearchResults {
  query: string
  creators: CreatorSearchHit[]
  posts: PostSearchHit[]
  tags: TagSearchHit[]
  categories: CategorySearchHit[]
}

export const TRENDING_SEARCHES = [
  { id: 't1', query: 'fitness', label: 'Fitness creators' },
  { id: 't2', query: 'reels', label: 'Reels' },
  { id: 't3', query: 'exclusive', label: 'Exclusive drops' },
  { id: 't4', query: 'travel', label: 'Travel' },
  { id: 't5', query: 'music', label: 'Music' },
  { id: 't6', query: 'bts', label: 'Behind the scenes' },
  { id: 't7', query: 'gaming', label: 'Gaming' },
  { id: 't8', query: 'fashion', label: 'Fashion lookbooks' },
] as const

const TAGS: Array<{ tag: string; label: string; aliases: string[] }> = [
  { tag: 'fitness', label: 'Fitness', aliases: ['workout', 'gym', 'training'] },
  { tag: 'music', label: 'Music', aliases: ['tracks', 'beats', 'songs'] },
  { tag: 'gaming', label: 'Gaming', aliases: ['stream', 'esports'] },
  { tag: 'travel', label: 'Travel', aliases: ['trip', 'wander'] },
  { tag: 'comedy', label: 'Comedy', aliases: ['funny', 'humor'] },
  { tag: 'finance', label: 'Finance', aliases: ['money', 'invest'] },
  { tag: 'technology', label: 'Technology', aliases: ['tech', 'gadgets'] },
  { tag: 'fashion', label: 'Fashion', aliases: ['style', 'lookbook'] },
  { tag: 'food', label: 'Food', aliases: ['recipes', 'cooking'] },
  { tag: 'exclusive', label: 'Exclusive', aliases: ['premium', 'members'] },
  { tag: 'bts', label: 'Behind the scenes', aliases: ['behind', 'studio'] },
  { tag: 'drops', label: 'Drops', aliases: ['release', 'launch'] },
  { tag: 'reels', label: 'Reels', aliases: ['reel', 'short'] },
  ...exploreCategories
    .filter((c): c is ExploreCategory => c !== 'For You')
    .map((c) => ({
      tag: c.toLowerCase(),
      label: c,
      aliases: [] as string[],
    })),
]

function uniqueTags() {
  const seen = new Set<string>()
  return TAGS.filter((t) => {
    if (seen.has(t.tag)) return false
    seen.add(t.tag)
    return true
  })
}

function tagCount(tag: string) {
  const needle = tag.toLowerCase()
  const creatorHits = feedCreators.filter(
    (c) =>
      c.category.toLowerCase() === needle ||
      c.bio.toLowerCase().includes(needle)
  ).length
  const postHits = feedPosts.filter((p) => {
    const tags = p.hashtags?.join(' ') ?? ''
    return (
      p.caption.toLowerCase().includes(needle) ||
      p.title.toLowerCase().includes(needle) ||
      tags.includes(needle) ||
      feedCreatorsById[p.creatorId]?.category.toLowerCase() === needle
    )
  }).length
  return Math.max(creatorHits + postHits, 3)
}

function categoryCount(category: ExploreCategory) {
  return Math.max(
    feedCreators.filter((c) => c.category === category).length * 4,
    6
  )
}

export function searchGlobal(query: string, limit = 5): SearchResults {
  const q = query.trim().toLowerCase()
  if (!q) {
    return { query: '', creators: [], posts: [], tags: [], categories: [] }
  }

  const creators: CreatorSearchHit[] = feedCreators
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
    .slice(0, limit)
    .map((creator) => ({
      kind: 'creator' as const,
      id: `creator-${creator.id}`,
      creator,
    }))

  const posts: PostSearchHit[] = feedPosts
    .filter((p) => {
      const creator = feedCreatorsById[p.creatorId]
      const tags = p.hashtags?.join(' ') ?? ''
      return (
        p.title.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q) ||
        tags.includes(q) ||
        creator?.name.toLowerCase().includes(q) ||
        creator?.handle.toLowerCase().includes(q)
      )
    })
    .slice(0, limit)
    .map((post) => ({
      kind: 'post' as const,
      id: `post-${post.id}`,
      post,
      creator: feedCreatorsById[post.creatorId]!,
    }))
    .filter((hit) => Boolean(hit.creator))

  const tags: TagSearchHit[] = uniqueTags()
    .filter(
      (t) =>
        t.tag.includes(q) ||
        t.label.toLowerCase().includes(q) ||
        t.aliases.some((a) => a.includes(q) || q.includes(a))
    )
    .slice(0, limit)
    .map((t) => ({
      kind: 'tag' as const,
      id: `tag-${t.tag}`,
      tag: t.tag,
      label: t.label,
      count: tagCount(t.tag),
    }))

  const categories: CategorySearchHit[] = exploreCategories
    .filter((c) => c !== 'For You')
    .filter(
      (c) =>
        c.toLowerCase().includes(q) ||
        q.includes(c.toLowerCase().slice(0, 4))
    )
    .slice(0, limit)
    .map((category) => ({
      kind: 'category' as const,
      id: `category-${category}`,
      category,
      label: category,
      count: categoryCount(category),
    }))

  return { query: query.trim(), creators, posts, tags, categories }
}

export function hasSearchResults(results: SearchResults) {
  return (
    results.creators.length > 0 ||
    results.posts.length > 0 ||
    results.tags.length > 0 ||
    results.categories.length > 0
  )
}
