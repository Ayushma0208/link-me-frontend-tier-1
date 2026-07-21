'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Send } from 'lucide-react'

import { StudioPageHeader } from '@/components/creator-studio/StudioPageHeader'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

type Person = {
  id: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}

type Conversation = {
  id: string
  peer?: Person
  fan?: Person
  lastMessagePreview?: string | null
  lastMessage?: { body?: string | null; content?: string | null }
  unreadCount?: number
}

type Message = {
  id: string
  senderId: string
  type?: string
  body?: string | null
  content?: string | null
  mediaUrl?: string | null
  createdAt: string
}

function listFrom<T>(response: T[] | { items?: T[] }) {
  return Array.isArray(response) ? response : response.items ?? []
}

function name(person?: Person) {
  return person?.displayName || person?.username || 'Fan'
}

export function CreatorMessagesStudio() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const conversationsQuery = useQuery({
    queryKey: ['creator-conversations'],
    queryFn: async () =>
      listFrom(
        await api<Conversation[] | { items?: Conversation[] }>(
          '/chat/conversations'
        )
      ),
    refetchInterval: 8_000,
  })
  const conversations = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data]
  )

  useEffect(() => {
    if (!activeId && conversations[0]?.id) setActiveId(conversations[0].id)
  }, [activeId, conversations])

  const messagesQuery = useQuery({
    queryKey: ['creator-conversation-messages', activeId],
    enabled: Boolean(activeId),
    queryFn: async () =>
      listFrom(
        await api<Message[] | { items?: Message[] }>(
          `/chat/conversations/${activeId}/messages?page=1&limit=100`
        )
      ),
    refetchInterval: 5_000,
  })

  const sendMessage = useMutation({
    mutationFn: async (body: string) => {
      if (!activeId) throw new Error('Select a conversation')
      return api<{ message: Message }>(
        `/chat/conversations/${activeId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ type: 'TEXT', body }),
        }
      )
    },
    onSuccess: () => {
      setDraft('')
      setError(null)
      void queryClient.invalidateQueries({
        queryKey: ['creator-conversation-messages', activeId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['creator-conversations'],
      })
    },
    onError: (reason) =>
      setError(
        reason instanceof ApiError || reason instanceof Error
          ? reason.message
          : 'Failed to send message'
      ),
  })

  const active = conversations.find((item) => item.id === activeId)
  const peer = active?.peer ?? active?.fan
  const messages = messagesQuery.data ?? []

  return (
    <div>
      <StudioPageHeader
        title="Messages"
        description="Read fan conversations and reply directly as yourself."
      />
      <div className="grid min-h-[68vh] overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="max-h-[68vh] overflow-y-auto border-b border-white/10 lg:border-r lg:border-b-0">
          {conversations.map((conversation) => {
            const conversationPeer = conversation.peer ?? conversation.fan
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={cn(
                  'w-full border-b border-white/5 px-4 py-4 text-left transition',
                  activeId === conversation.id
                    ? 'bg-fuchsia-500/10'
                    : 'hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {name(conversationPeer)}
                  </p>
                  {Number(conversation.unreadCount) > 0 ? (
                    <span className="rounded-full bg-fuchsia-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </div>
                {conversationPeer?.username ? (
                  <p className="text-[11px] text-white/35">
                    @{conversationPeer.username}
                  </p>
                ) : null}
                <p className="mt-1 truncate text-xs text-white/50">
                  {conversation.lastMessage?.body ||
                    conversation.lastMessage?.content ||
                    conversation.lastMessagePreview ||
                    'No messages yet'}
                </p>
              </button>
            )
          })}
          {conversationsQuery.isLoading ? (
            <p className="p-5 text-sm text-white/40">Loading inbox…</p>
          ) : null}
          {!conversationsQuery.isLoading && conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center text-white/40">
              <MessageSquare className="size-8 opacity-40" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : null}
        </aside>

        <section className="flex min-h-[520px] flex-col">
          {activeId ? (
            <>
              <header className="border-b border-white/10 px-5 py-4">
                <p className="font-semibold text-white">{name(peer)}</p>
                {peer?.username ? (
                  <p className="text-xs text-white/40">@{peer.username}</p>
                ) : null}
              </header>
              <div className="flex-1 space-y-2.5 overflow-y-auto p-5">
                {messagesQuery.isLoading ? (
                  <p className="text-sm text-white/40">Loading messages…</p>
                ) : null}
                {messages.map((message) => {
                  const mine = message.senderId === user?.id
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm',
                        mine
                          ? 'ml-auto rounded-br-md bg-fuchsia-500/25 text-white'
                          : 'rounded-bl-md bg-white/[0.08] text-white/85'
                      )}
                    >
                      {message.type === 'IMAGE' && message.mediaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={message.mediaUrl}
                          alt="Shared media"
                          className="mb-2 max-h-56 rounded-xl object-cover"
                        />
                      ) : null}
                      {message.type === 'AUDIO' && message.mediaUrl ? (
                        <audio controls src={message.mediaUrl} className="w-full" />
                      ) : null}
                      {message.body || message.content}
                      <p className="mt-1 text-[10px] text-white/30">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )
                })}
              </div>
              {error ? (
                <p className="px-5 pb-2 text-sm text-rose-300">{error}</p>
              ) : null}
              <form
                className="flex gap-2 border-t border-white/10 p-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (draft.trim()) sendMessage.mutate(draft.trim())
                }}
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Reply to ${name(peer)}…`}
                  className="h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-fuchsia-400/35"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sendMessage.isPending}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black disabled:opacity-40"
                >
                  <Send className="size-4" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-white/35">
              <MessageSquare className="size-10 opacity-40" />
              <p className="text-sm">Select a conversation</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
