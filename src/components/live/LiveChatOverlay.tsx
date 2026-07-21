'use client'

import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { Send, Smile } from 'lucide-react'
import {
  connectLiveSocket,
  type LiveChatMessage,
} from '@/lib/live-socket'
import { cn } from '@/lib/utils'

const EMOJI_SET = [
  '❤️',
  '🔥',
  '😂',
  '😍',
  '👏',
  '😮',
  '💯',
  '🎉',
  '🙏',
  '✨',
  '💪',
  '🥰',
]

interface LiveChatOverlayProps {
  liveId: string
  emojiPrice: number | null
  isHost: boolean
}

export function LiveChatOverlay({
  liveId,
  emojiPrice,
  isHost,
}: LiveChatOverlayProps) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [burst, setBurst] = useState<{ id: number; emoji: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [joined, setJoined] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const burstId = useRef(0)
  const joinedRef = useRef(false)

  useEffect(() => {
    const socket = connectLiveSocket()
    if (!socket) {
      setError('Sign in to chat')
      return
    }
    socketRef.current = socket
    joinedRef.current = false
    setJoined(false)

    const join = () => {
      socket.emit('live:join', { liveId })
    }

    const onJoined = (payload: { messages?: LiveChatMessage[] }) => {
      joinedRef.current = true
      const history = Array.isArray(payload.messages) ? payload.messages : []
      setMessages((prev) => {
        const byId = new Map<string, LiveChatMessage>()
        for (const m of history) byId.set(m.id, m)
        for (const m of prev) byId.set(m.id, m)
        return [...byId.values()]
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .slice(-80)
      })
      setJoined(true)
      setError(null)
    }

    const onMessage = (msg: LiveChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg].slice(-80)
      })
    }

    const onBurst = (payload: { emoji?: string }) => {
      if (!payload.emoji) return
      burstId.current += 1
      setBurst({ id: burstId.current, emoji: payload.emoji })
      window.setTimeout(() => {
        setBurst((b) => (b?.id === burstId.current ? null : b))
      }, 1800)
    }

    const onLiveError = (payload: { message?: string }) => {
      setError(payload?.message ?? 'Chat error')
      setSending(false)
    }

    socket.on('live:joined', onJoined)
    socket.on('live:message', onMessage)
    socket.on('live:emoji-burst', onBurst)
    socket.on('live:error', onLiveError)
    socket.on('connect', join)
    socket.on('reconnect', join)

    if (socket.connected) join()
    else socket.connect()

    // Retry join until ack — host studio often mounts before the socket is ready.
    const retry = window.setInterval(() => {
      if (joinedRef.current || !socket.connected) return
      join()
    }, 2000)

    return () => {
      window.clearInterval(retry)
      socket.off('live:joined', onJoined)
      socket.off('live:message', onMessage)
      socket.off('live:emoji-burst', onBurst)
      socket.off('live:error', onLiveError)
      socket.off('connect', join)
      socket.off('reconnect', join)
      socket.disconnect()
      socketRef.current = null
    }
  }, [liveId])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  function sendText() {
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    setError(null)
    socketRef.current?.emit('live:text', { liveId, body })
    setDraft('')
    setSending(false)
  }

  function sendEmoji(emoji: string) {
    if (sending) return
    if (!isHost && !(emojiPrice != null && emojiPrice > 0)) {
      setError('Emoji reactions are not enabled')
      return
    }
    setSending(true)
    setError(null)
    setShowEmojis(false)
    socketRef.current?.emit('live:emoji', { liveId, emoji })
    setSending(false)
  }

  const tipLabel =
    isHost
      ? 'Free for host'
      : emojiPrice != null && emojiPrice > 0
        ? `₹${emojiPrice}`
        : '—'

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col justify-end pb-4 pt-24">
      {burst ? (
        <div
          key={burst.id}
          className="pointer-events-none absolute bottom-28 right-8 animate-bounce text-5xl"
          aria-hidden
        >
          {burst.emoji}
        </div>
      ) : null}

      <div
        ref={listRef}
        className="pointer-events-none mb-3 max-h-[42vh] space-y-1.5 overflow-y-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-md [&::-webkit-scrollbar]:hidden"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-end gap-2 rounded-2xl bg-black/50 px-2.5 py-1.5 shadow-sm backdrop-blur-md"
          >
            <span className="shrink-0 text-[12px] font-bold text-white">
              {msg.user.name}
            </span>
            {msg.kind === 'EMOJI' ? (
              <span className="text-[20px] leading-none">{msg.body}</span>
            ) : (
              <span className="min-w-0 text-[13px] leading-snug text-white/90">
                {msg.body}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-auto px-3 sm:max-w-md">
        {error ? (
          <p className="mb-1.5 rounded-full bg-rose-600/80 px-3 py-1 text-[11px] text-white">
            {error}
          </p>
        ) : null}
        {!joined && !error ? (
          <p className="mb-1.5 px-1 text-[11px] text-white/45">
            Connecting to live chat…
          </p>
        ) : null}
        {showEmojis ? (
          <div className="mb-2 grid grid-cols-6 gap-1.5 rounded-2xl border border-white/15 bg-black/70 p-2 backdrop-blur-md">
            {EMOJI_SET.map((emoji) => (
              <button
                key={emoji}
                type="button"
                disabled={sending}
                onClick={() => sendEmoji(emoji)}
                className="flex flex-col items-center rounded-xl px-1 py-1.5 transition hover:bg-white/10"
              >
                <span className="text-[22px] leading-none">{emoji}</span>
                <span className="mt-0.5 text-[9px] font-medium text-white/50">
                  {tipLabel}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/55 py-1.5 pr-1.5 pl-3 backdrop-blur-md">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                sendText()
              }
            }}
            placeholder="Say something…"
            maxLength={280}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={() => setShowEmojis((v) => !v)}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full transition',
              showEmojis
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10'
            )}
            aria-label="Emojis"
          >
            <Smile className="size-4" />
          </button>
          <button
            type="button"
            onClick={sendText}
            disabled={!draft.trim() || sending}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#07070b] transition hover:bg-white/90 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="size-3.5" />
          </button>
        </div>
        {!isHost && emojiPrice != null && emojiPrice > 0 ? (
          <p className="mt-1.5 px-1 text-[10px] text-white/40">
            Comments free · Emojis ₹{emojiPrice} each (wallet)
          </p>
        ) : null}
      </div>
    </div>
  )
}
