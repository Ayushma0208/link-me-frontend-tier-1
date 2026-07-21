import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/),
  role: z.enum(['creator', 'user']),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const updateCreatorProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().nullable(),
  coverVideo: z.string().url().optional().nullable(),
  videoMaskStyle: z
    .enum(['creative', 'splash-water', 'text-overlay', 'hexagon', 'hexagon-two'])
    .optional(),
  coffeeUnitPrice: z.number().min(0).optional(),
  chatPricePerMessage: z.number().min(0).optional(),
  callPricePerMinute: z.number().min(0).optional(),
  freePostCount: z.number().int().min(0).max(10).optional(),
})

export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  icon: z.string().min(1),
})

export const createPostSchema = z.object({
  type: z.enum(['image', 'video', 'reel']),
  title: z.string().min(1).max(200),
  mediaKey: z.string().min(1),
  thumbnailKey: z.string().optional(),
  isFreeOverride: z.boolean().optional(),
  perPostPrice: z.number().min(0).optional(),
})

export const createStorySchema = z.object({
  type: z.enum(['image', 'video', 'reel']),
  mediaKey: z.string().min(1),
  thumbnailKey: z.string().optional(),
})

export const createHighlightSchema = z.object({
  title: z.string().min(1).max(50),
  thumbnailKey: z.string().optional(),
})

export const addHighlightItemSchema = z.object({
  storyId: z.string().uuid().optional(),
  postId: z.string().uuid().optional(),
})

export const walletTopupSchema = z.object({
  amount: z.number().min(10).max(100000),
})

export const subscribeSchema = z.object({
  creatorId: z.string().uuid(),
  planId: z.string().uuid(),
})

export const postSubscribeSchema = z.object({
  postId: z.string().uuid(),
})

export const tipSchema = z.object({
  creatorId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100),
  useWallet: z.boolean().optional(),
})

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(2000),
})

export const startConversationSchema = z.object({
  creatorId: z.string().uuid(),
})

export const requestCallSchema = z.object({
  creatorId: z.string().uuid(),
})

export const presignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.enum(['posts', 'stories', 'avatars', 'highlights']),
})

export const subscriptionPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(1),
  type: z.enum(['image', 'video', 'full']),
  features: z.array(z.string()).default([]),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateCreatorProfileInput = z.infer<typeof updateCreatorProfileSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateStoryInput = z.infer<typeof createStorySchema>
export type WalletTopupInput = z.infer<typeof walletTopupSchema>
export type TipInput = z.infer<typeof tipSchema>
