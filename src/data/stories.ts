export type StoryMediaType = 'image' | 'video'

export interface StoryItem {
  id: string
  mediaUrl: string
  type: StoryMediaType
  durationMs?: number
}

export interface StoryCreator {
  id: string
  name: string
  handle: string
  avatar: string
  verified: boolean
  seen: boolean
  stories: StoryItem[]
}

/** No demo story creators — home rail uses live admin stories only. */
export const followingStoryCreators: StoryCreator[] = []

export const suggestedStoryCreators: StoryCreator[] = []

export const DEMO_FOLLOWING_STORIES = followingStoryCreators

export const DEMO_EMPTY_FOLLOWING: StoryCreator[] = []
