import { api } from '@/lib/api'

export type PostComment = {
  id: string
  postId: string
  userId: string
  parentId?: string | null
  body: string
  likeCount?: number
  liked?: boolean
  createdAt: string
  user: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  replies?: PostComment[]
}

export function likePost(postId: string) {
  return api<{ liked: boolean; likeCount: number }>(`/posts/${postId}/like`, {
    method: 'POST',
  })
}

export function unlikePost(postId: string) {
  return api<{ liked: boolean; likeCount: number }>(`/posts/${postId}/like`, {
    method: 'DELETE',
  })
}

export function listPostComments(postId: string, page = 1, limit = 40) {
  return api<PostComment[]>(
    `/posts/${postId}/comments?page=${page}&limit=${limit}`
  )
}

export function addPostComment(
  postId: string,
  body: string,
  parentId?: string | null
) {
  return api<{ comment: PostComment; commentCount: number }>(
    `/posts/${postId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({
        body,
        ...(parentId ? { parentId } : {}),
      }),
    }
  )
}

export function likeComment(postId: string, commentId: string) {
  return api<{ liked: boolean; likeCount: number }>(
    `/posts/${postId}/comments/${commentId}/like`,
    { method: 'POST' }
  )
}

export function unlikeComment(postId: string, commentId: string) {
  return api<{ liked: boolean; likeCount: number }>(
    `/posts/${postId}/comments/${commentId}/like`,
    { method: 'DELETE' }
  )
}

export function translateText(text: string, targetLocale?: string) {
  return api<{
    original: string
    translatedText: string
    translatedTo: string
  }>('/translate', {
    method: 'POST',
    body: JSON.stringify({
      text,
      ...(targetLocale ? { targetLocale } : {}),
    }),
  })
}
