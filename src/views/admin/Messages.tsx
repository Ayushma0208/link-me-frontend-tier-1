'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Sparkles, Send } from 'lucide-react'

import { api, ApiError } from '@/lib/api'
import { connectChatSocket } from '@/lib/chat-socket'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type UserLite = {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

type AdminChatThread = {
  id: string
  fan: UserLite
  creator: UserLite
  lastMessageAt: string | null
  lastMessagePreview: string | null
  unreadFromFan: number
  label: string
}

type AdminChatMessage = {
  id: string
  senderId: string
  type?: string
  body: string | null
  mediaUrl?: string | null
  amountCharged?: string | null
  createdAt: string
}

type CreatorOption = {
  id: string
  userId: string
  user: { id: string; username: string; displayName: string }
}

function displayName(u: UserLite) {
  return u.displayName || u.username
}

export function AdminMessages() {
  const queryClient = useQueryClient()
  const [creatorUserId, setCreatorUserId] = useState<string>('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: creators = [] } = useQuery({
    queryKey: ['admin-creators-for-chat'],
    queryFn: async () => {
      const res = await api<CreatorOption[] | { items: CreatorOption[] }>(
        '/admin/creators?limit=100'
      )
      return Array.isArray(res) ? res : res.items ?? []
    },
  })

  const threadsQuery = useQuery({
    queryKey: ['admin-chat-threads', creatorUserId],
    queryFn: async () => {
      const qs = new URLSearchParams({ limit: '50' })
      if (creatorUserId) qs.set('creatorUserId', creatorUserId)
      const res = await api<AdminChatThread[] | { items: AdminChatThread[] }>(
        `/admin/chat/conversations?${qs}`
      )
      return Array.isArray(res) ? res : res.items ?? []
    },
    refetchInterval: 8_000,
  })

  const threads = threadsQuery.data ?? []
  const active = threads.find((t) => t.id === activeId) ?? null

  const messagesQuery = useQuery({
    queryKey: ['admin-chat-messages', activeId],
    enabled: Boolean(activeId),
    queryFn: async () => {
      const res = await api<{
        conversation: {
          id: string
          fan: UserLite
          creator: UserLite
        }
        items: AdminChatMessage[]
      }>(`/admin/chat/conversations/${activeId}/messages?page=1&limit=100`)
      return res
    },
    refetchInterval: 5_000,
  })

  const conversation = messagesQuery.data?.conversation
  const messages = messagesQuery.data?.items ?? []

  useEffect(() => {
    const socket = connectChatSocket()
    if (!socket) return

    socket.on(
      'admin:message:new',
      (payload: {
        conversationId: string
        message: AdminChatMessage
      }) => {
        if (payload.conversationId === activeId) {
          queryClient.setQueryData<{
            conversation: {
              id: string
              fan: UserLite
              creator: UserLite
            }
            items: AdminChatMessage[]
          }>(['admin-chat-messages', activeId], (current) => {
            if (!current) return current
            if (current.items.some((item) => item.id === payload.message.id)) {
              return current
            }
            return {
              ...current,
              items: [...current.items, payload.message],
            }
          })
        }
        void queryClient.invalidateQueries({
          queryKey: ['admin-chat-threads'],
        })
      }
    )

    return () => {
      socket.disconnect()
    }
  }, [activeId, queryClient])

  useEffect(() => {
    if (!activeId && threads[0]?.id) setActiveId(threads[0].id)
  }, [activeId, threads])

  const sendReply = useMutation({
    mutationFn: async (payload: { body: string; useAi?: boolean }) => {
      if (!activeId) throw new Error('No conversation selected')
      return api<{ message: AdminChatMessage; usedAi: boolean }>(
        `/admin/chat/conversations/${activeId}/replies`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )
    },
    onSuccess: () => {
      setDraft('')
      setError(null)
      void queryClient.invalidateQueries({
        queryKey: ['admin-chat-messages', activeId],
      })
      void queryClient.invalidateQueries({ queryKey: ['admin-chat-threads'] })
    },
    onError: (err) => {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Failed to send reply'
      )
    },
  })

  const aiDraft = useMutation({
    mutationFn: async () => {
      if (!activeId) throw new Error('No conversation selected')
      return api<{ draft: string }>(
        `/admin/chat/conversations/${activeId}/ai-draft`,
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      )
    },
    onSuccess: (res) => {
      setDraft(res.draft)
      setError(null)
    },
    onError: (err) => {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Failed to generate AI draft'
      )
    },
  })

  const header = useMemo(() => {
    if (!active && !conversation) return null
    const fan = conversation?.fan ?? active?.fan
    const creator = conversation?.creator ?? active?.creator
    if (!fan || !creator) return null
    return {
      fan,
      creator,
      title: `${displayName(fan)} → ${displayName(creator)}`,
      subtitle: `@${fan.username} messaging @${creator.username}`,
    }
  }, [active, conversation])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted">
            See which fan is texting which AI creator — reply manually or with AI
          </p>
        </div>
        <label className="text-sm text-white/60">
          Filter by creator
          <select
            className="mt-1 block min-w-[200px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={creatorUserId}
            onChange={(e) => {
              setCreatorUserId(e.target.value)
              setActiveId(null)
            }}
          >
            <option value="">All creators</option>
            {creators.map((c) => (
              <option key={c.id} value={c.userId || c.user.id}>
                {c.user.displayName} (@{c.user.username})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          {threadsQuery.isLoading ? (
            <p className="p-4 text-sm text-white/40">Loading chats…</p>
          ) : null}
          {threads.map((thread) => {
            const selected = thread.id === activeId
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveId(thread.id)}
                className={cn(
                  'w-full border-b border-white/5 px-4 py-3 text-left transition',
                  selected ? 'bg-white/10' : 'hover:bg-white/[0.04]'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-white">
                    {displayName(thread.fan)}
                    <span className="font-normal text-white/40"> → </span>
                    {displayName(thread.creator)}
                  </p>
                  {thread.unreadFromFan > 0 ? (
                    <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {thread.unreadFromFan}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-white/40">
                  @{thread.fan.username} → @{thread.creator.username}
                </p>
                <p className="mt-1 truncate text-[12px] text-white/55">
                  {thread.lastMessagePreview || 'No messages yet'}
                </p>
              </button>
            )
          })}
          {!threadsQuery.isLoading && threads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center text-white/40">
              <MessageSquare className="size-8 opacity-40" />
              <p className="text-sm">No fan–creator chats yet</p>
            </div>
          ) : null}
        </div>

        <div className="flex min-h-[70vh] flex-col rounded-2xl border border-white/10 bg-white/[0.02]">
          {activeId && header ? (
            <>
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">{header.title}</p>
                <p className="text-[12px] text-white/45">{header.subtitle}</p>
                <p className="mt-1 text-[11px] text-emerald-300/80">
                  Replies are sent as {displayName(header.creator)} (the
                  influencer), not as admin.
                </p>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
                {messagesQuery.isLoading ? (
                  <p className="text-sm text-white/40">Loading messages…</p>
                ) : null}
                {messages.map((m) => {
                  const fromCreator = m.senderId === header.creator.id
                  const fromFan = m.senderId === header.fan.id
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
                        fromCreator
                          ? 'ml-auto rounded-br-md bg-fuchsia-500/25 text-white'
                          : fromFan
                            ? 'rounded-bl-md bg-sky-500/20 text-white'
                            : 'bg-white/10 text-white/80'
                      )}
                    >
                      <p className="mb-1 text-[10px] uppercase tracking-wide text-white/40">
                        {fromCreator
                          ? displayName(header.creator)
                          : fromFan
                            ? displayName(header.fan)
                            : 'System'}
                      </p>
                      {m.type === 'IMAGE' && m.mediaUrl ? (
                        // Chat media may be hosted on configured storage.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.mediaUrl}
                          alt={m.body || 'Shared image'}
                          className="mb-1 max-h-48 rounded-xl object-cover"
                        />
                      ) : null}
                      {m.type === 'AUDIO' && m.mediaUrl ? (
                        <audio controls src={m.mediaUrl} className="mb-1 w-full" />
                      ) : null}
                      {m.body ? <p>{m.body}</p> : null}
                      {Number(m.amountCharged ?? 0) > 0 ? (
                        <p className="mt-1 text-[11px] text-white/40">
                          Charged ₹{Number(m.amountCharged).toFixed(2)}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
                {!messagesQuery.isLoading && messages.length === 0 ? (
                  <p className="text-sm text-white/40">No messages in this thread</p>
                ) : null}
              </div>

              {error ? (
                <p className="px-4 pb-2 text-sm text-rose-400">{error}</p>
              ) : null}

              <div className="border-t border-white/10 p-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder={`Reply as ${displayName(header.creator)}…`}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={aiDraft.isPending || sendReply.isPending}
                    onClick={() => aiDraft.mutate()}
                  >
                    <Sparkles className="size-4" />
                    {aiDraft.isPending ? 'Generating…' : 'AI draft'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={sendReply.isPending}
                    onClick={() =>
                      sendReply.mutate({ body: draft || '…', useAi: true })
                    }
                  >
                    <Sparkles className="size-4" />
                    {sendReply.isPending ? 'Sending…' : 'Send AI reply'}
                  </Button>
                  <Button
                    type="button"
                    disabled={!draft.trim() || sendReply.isPending}
                    onClick={() => sendReply.mutate({ body: draft.trim() })}
                  >
                    <Send className="size-4" />
                    {sendReply.isPending ? 'Sending…' : 'Send as creator'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-white/40">
              <MessageSquare className="size-10 opacity-40" />
              <p className="text-sm">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
