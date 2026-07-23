'use client'

import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { Gift, Pin, PinOff, Send, Smile } from 'lucide-react'
import {
  connectLiveSocket,
  type LiveChatMessage,
} from '@/lib/live-socket'
import { LIVE_GIFTS, getLiveGift } from '@/lib/live-gifts'
import { cn, formatCurrency } from '@/lib/utils'

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

type PickerMode = 'none' | 'emoji' | 'gift'

interface LiveChatOverlayProps {
  liveId: string
  emojiPrice: number | null
  isHost: boolean
}

function messagePreview(msg: LiveChatMessage): string {
  if (msg.kind === 'EMOJI') return msg.body
  if (msg.kind === 'GIFT') {
    const gift = getLiveGift(msg.giftId ?? msg.body)
    return `${msg.giftEmoji ?? gift?.emoji ?? '🎁'} ${msg.giftLabel ?? gift?.label ?? 'Gift'}`
  }
  return msg.body
}

export function LiveChatOverlay({
  liveId,
  emojiPrice,
  isHost,
}: LiveChatOverlayProps) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([])
  const [pinned, setPinned] = useState<LiveChatMessage | null>(null)
  const [draft, setDraft] = useState('')
  const [picker, setPicker] = useState<PickerMode>('none')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [joined, setJoined] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
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
    setPinned(null)

    const join = () => {
      socket.emit('live:join', { liveId })
    }

    const onJoined = (payload: {
      messages?: LiveChatMessage[]
      pinnedMessage?: LiveChatMessage | null
    }) => {
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
      if (payload.pinnedMessage !== undefined) {
        setPinned(payload.pinnedMessage ?? null)
      }
      setJoined(true)
      setError(null)
    }

    const onMessage = (msg: LiveChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg].slice(-80)
      })
    }

    const onPinned = (payload: {
      liveId?: string
      message?: LiveChatMessage | null
    }) => {
      setPinned(payload.message ?? null)
    }

    const onLiveError = (payload: { message?: string }) => {
      setError(payload?.message ?? 'Chat error')
      setSending(false)
    }

    socket.on('live:joined', onJoined)
    socket.on('live:message', onMessage)
    socket.on('live:pinned', onPinned)
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
      socket.off('live:pinned', onPinned)
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
    setPicker('none')
    socketRef.current?.emit('live:emoji', { liveId, emoji })
    setSending(false)
  }

  function sendGift(giftId: string) {
    if (sending) return
    setSending(true)
    setError(null)
    setPicker('none')
    socketRef.current?.emit('live:gift', { liveId, giftId })
    setSending(false)
  }

  function pinMessage(messageId: string) {
    if (!isHost) return
    setError(null)
    socketRef.current?.emit('live:pin', { liveId, messageId })
  }

  function unpinMessage() {
    if (!isHost) return
    setError(null)
    socketRef.current?.emit('live:unpin', { liveId })
  }

  const tipLabel =
    isHost
      ? 'Free for host'
      : emojiPrice != null && emojiPrice > 0
        ? `₹${emojiPrice}`
        : '—'

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col justify-end pb-4 pt-24">
      {pinned ? (
        <div className="pointer-events-auto mb-2 px-3 sm:max-w-md">
          <div className="flex items-start gap-2 rounded-2xl border border-amber-400/35 bg-amber-500/20 px-2.5 py-2 shadow-sm backdrop-blur-md">
            <Pin className="mt-0.5 size-3.5 shrink-0 text-amber-200" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-amber-100">
                Pinned · {pinned.user.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-white">
                {messagePreview(pinned)}
              </p>
            </div>
            {isHost ? (
              <button
                type="button"
                onClick={unpinMessage}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-amber-100/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Unpin message"
                title="Unpin"
              >
                <PinOff className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        ref={listRef}
        className={cn(
          'mb-3 max-h-[42vh] space-y-1.5 overflow-y-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-md [&::-webkit-scrollbar]:hidden',
          isHost ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {messages.map((msg) => {
          const gift =
            msg.kind === 'GIFT'
              ? getLiveGift(msg.giftId ?? msg.body)
              : undefined
          const giftEmoji = msg.giftEmoji ?? gift?.emoji
          const giftLabel = msg.giftLabel ?? gift?.label ?? 'Gift'
          const isPinned = pinned?.id === msg.id
          return (
            <div
              key={msg.id}
              className={cn(
                'flex items-end gap-2 rounded-2xl bg-black/50 px-2.5 py-1.5 shadow-sm backdrop-blur-md',
                isPinned && 'ring-1 ring-amber-400/40'
              )}
            >
              <span className="shrink-0 text-[12px] font-bold text-white">
                {msg.user.name}
              </span>
              {msg.kind === 'EMOJI' ? (
                <span className="min-w-0 flex-1 text-[20px] leading-none">
                  {msg.body}
                </span>
              ) : msg.kind === 'GIFT' ? (
                <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-[13px] leading-snug text-white/90">
                  <span className="text-[18px] leading-none">
                    {giftEmoji ?? '🎁'}
                  </span>
                  <span>{giftLabel}</span>
                  {msg.amountCharged > 0 ? (
                    <span className="text-[11px] text-amber-200/90">
                      {formatCurrency(msg.amountCharged)}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="min-w-0 flex-1 text-[13px] leading-snug text-white/90">
                  {msg.body}
                </span>
              )}
              {isHost ? (
                <button
                  type="button"
                  onClick={() =>
                    isPinned ? unpinMessage() : pinMessage(msg.id)
                  }
                  className={cn(
                    'mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full transition',
                    isPinned
                      ? 'bg-amber-400/30 text-amber-100'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  )}
                  aria-label={isPinned ? 'Unpin message' : 'Pin message'}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  {isPinned ? (
                    <PinOff className="size-3.5" />
                  ) : (
                    <Pin className="size-3.5" />
                  )}
                </button>
              ) : null}
            </div>
          )
        })}
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
        {picker === 'emoji' ? (
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
        {picker === 'gift' ? (
          <div className="mb-2 grid grid-cols-5 gap-1.5 rounded-2xl border border-white/15 bg-black/70 p-2 backdrop-blur-md">
            {LIVE_GIFTS.map((gift) => (
              <button
                key={gift.id}
                type="button"
                disabled={sending}
                onClick={() => sendGift(gift.id)}
                className="flex flex-col items-center rounded-xl px-1 py-1.5 transition hover:bg-white/10"
              >
                <span className="text-[22px] leading-none">{gift.emoji}</span>
                <span className="mt-0.5 text-[9px] font-medium text-white/70">
                  {gift.label}
                </span>
                <span className="text-[9px] font-medium text-amber-200/80">
                  {isHost ? 'Free' : formatCurrency(gift.price)}
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
            onClick={() =>
              setPicker((v) => (v === 'gift' ? 'none' : 'gift'))
            }
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full transition',
              picker === 'gift'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10'
            )}
            aria-label="Gifts"
          >
            <Gift className="size-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              setPicker((v) => (v === 'emoji' ? 'none' : 'emoji'))
            }
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full transition',
              picker === 'emoji'
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
        {!isHost ? (
          <p className="mt-1.5 px-1 text-[10px] text-white/40">
            Comments free
            {emojiPrice != null && emojiPrice > 0
              ? ` · Emojis ₹${emojiPrice}`
              : ''}{' '}
            · Gifts from wallet
          </p>
        ) : null}
      </div>
    </div>
  )
}
