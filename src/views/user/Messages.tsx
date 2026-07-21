'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import {
  itemPriceFromSession,
  planModeLabel,
  type ChatSession,
} from '@/lib/chat-plans'
import { fetchWalletAvailableBalance } from '@/lib/razorpay-checkout'
import { useAuthStore } from '@/stores/auth'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface ConversationRow {
  id: string
  peer?: { id: string; displayName?: string; username?: string }
  lastMessagePreview?: string | null
  creatorName?: string
  lastMessage?: { content?: string }
}

interface ChatMessage {
  id: string
  senderId: string
  body?: string | null
  content?: string
  amountCharged?: string | number | null
  createdAt: string
}

export function UserMessages() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [balance, setBalance] = useState<number | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [session, setSession] = useState<ChatSession | null>(null)
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api<ConversationRow[] | { items: ConversationRow[] }>(
        '/chat/conversations'
      )
      return Array.isArray(res) ? res : res.items ?? []
    },
  })

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeId],
    queryFn: async () => {
      const res = await api<ChatMessage[] | { items: ChatMessage[] }>(
        `/chat/conversations/${activeId}/messages?page=1&limit=50`
      )
      return Array.isArray(res) ? res : res.items ?? []
    },
    enabled: !!activeId,
  })

  useEffect(() => {
    void fetchWalletAvailableBalance()
      .then(setBalance)
      .catch(() => setBalance(null))
    if (!activeId) {
      setSession(null)
      return
    }
    void api<{ session: ChatSession | null }>(
      `/chat/conversations/${activeId}/session`
    )
      .then((res) => setSession(res.session))
      .catch(() => setSession(null))
  }, [activeId])

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!activeId) throw new Error('No conversation selected')
      return api<{
        message: ChatMessage
        replyMessage?: ChatMessage | null
        session?: ChatSession | null
      }>(`/chat/conversations/${activeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'TEXT',
          body: content,
          ...(session?.id ? { sessionId: session.id } : {}),
        }),
      })
    },
    onSuccess: async (res) => {
      setDraft('')
      setSendError(null)
      if (res.session) setSession(res.session)
      queryClient.setQueryData(
        ['messages', activeId],
        (prev: ChatMessage[] | undefined) => {
          const base = prev ?? []
          const next = [...base, res.message]
          if (res.replyMessage) next.push(res.replyMessage)
          return next
        }
      )
      const b = await fetchWalletAvailableBalance().catch(() => null)
      if (b != null) setBalance(b)
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      void refetchMessages()
    },
    onError: (err) => {
      setSendError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Failed to send'
      )
      void fetchWalletAvailableBalance()
        .then(setBalance)
        .catch(() => null)
    },
  })

  const activeConv = conversations.find((c) => c.id === activeId)
  const title =
    activeConv?.creatorName ||
    activeConv?.peer?.displayName ||
    activeConv?.peer?.username ||
    'Chat'

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted">
            Chat with creators using package, per-minute, or per-message plans
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="text-muted">Wallet</p>
          <p className="font-semibold">
            {balance == null ? '—' : formatCurrency(balance)}
          </p>
          <Link
            href="/user/wallet"
            className="text-xs text-brand-400 underline underline-offset-2"
          >
            Add funds
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className={`cursor-pointer ${
                activeId === conv.id ? 'border-brand-500' : ''
              }`}
              onClick={() => setActiveId(conv.id)}
            >
              <CardTitle className="text-base">
                {conv.creatorName ||
                  conv.peer?.displayName ||
                  conv.peer?.username ||
                  'Creator'}
              </CardTitle>
              <p className="truncate text-sm text-muted">
                {conv.lastMessage?.content ??
                  conv.lastMessagePreview ??
                  'No messages yet'}
              </p>
            </Card>
          ))}
          {conversations.length === 0 && (
            <p className="text-sm text-muted">
              Start a chat from a creator&apos;s profile
            </p>
          )}
        </div>

        <Card className="flex min-h-[400px] flex-col lg:col-span-2">
          {activeId ? (
            <>
              <div className="border-b border-border p-4">
                <CardTitle className="text-base">{title}</CardTitle>
                {session ? (
                  <p className="mt-1 text-xs text-muted">
                    {planModeLabel(session.mode)}
                    {session.mode === 'PER_ITEM'
                      ? ` · next text ${formatCurrency(itemPriceFromSession(session, 'TEXT'))}`
                      : session.mode === 'PER_MINUTE'
                        ? ` · ${formatCurrency(Number(session.pricePerMinute ?? 0))}/min`
                        : session.remainingSeconds != null
                          ? ` · ${Math.floor(session.remainingSeconds / 60)}:${String(session.remainingSeconds % 60).padStart(2, '0')} left`
                          : ''}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted">
                    Open the creator profile to buy or start a chat plan
                  </p>
                )}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => {
                  const text = m.body || m.content || ''
                  const charged = Number(m.amountCharged ?? 0)
                  return (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        m.senderId === user?.id
                          ? 'ml-auto bg-brand-600/30'
                          : 'bg-surface-overlay'
                      }`}
                    >
                      {text}
                      {m.senderId === user?.id && charged > 0 ? (
                        <p className="mt-1 text-xs text-muted">
                          −{formatCurrency(charged)}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
              {sendError ? (
                <p className="px-4 pb-2 text-sm text-red-400">
                  {sendError}{' '}
                  <Link href="/user/wallet" className="underline">
                    Top up wallet
                  </Link>
                </p>
              ) : null}
              <div className="flex gap-2 border-t border-border p-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-border bg-surface px-4 py-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && draft.trim()) {
                      sendMessage.mutate(draft.trim())
                    }
                  }}
                />
                <Button
                  onClick={() => draft.trim() && sendMessage.mutate(draft.trim())}
                  disabled={sendMessage.isPending}
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted">
              Select a conversation
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
