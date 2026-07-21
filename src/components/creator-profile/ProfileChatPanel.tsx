'use client'

import { useEffect, useRef, useState } from 'react'
import NextImage from 'next/image'
import Link from 'next/link'
import type { Socket } from 'socket.io-client'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ImagePlus,
  Maximize2,
  Mic,
  Minimize2,
  Send,
  Square,
  X,
} from 'lucide-react'

import { api, ApiError } from '@/lib/api'
import { connectChatSocket } from '@/lib/chat-socket'
import {
  itemPriceFromSession,
  planModeLabel,
  type ChatSession,
} from '@/lib/chat-plans'
import { uploadMediaFile } from '@/lib/media-upload'
import { fetchWalletAvailableBalance } from '@/lib/razorpay-checkout'
import { useAuthStore } from '@/stores/auth'
import { cn, formatCurrency } from '@/lib/utils'

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  type?: string
  body: string | null
  content?: string
  mediaKey?: string | null
  mediaUrl?: string | null
  amountCharged?: string | number | null
  createdAt: string
}

interface PendingMedia {
  file: File
  type: 'IMAGE' | 'AUDIO'
  previewUrl: string
  durationSeconds?: number
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

function appendUnique(
  current: ChatMessage[],
  incoming: ChatMessage | null | undefined
) {
  if (!incoming || current.some((message) => message.id === incoming.id)) {
    return current
  }
  return [...current, incoming]
}

export interface ProfileChatPanelProps {
  open: boolean
  conversationId: string | null
  creatorName: string
  creatorHandle: string
  creatorAvatar: string
  /** Fallback per-message price when no session is loaded */
  pricePerMessage?: number
  initialSession?: ChatSession | null
  onSessionChange?: (session: ChatSession | null) => void
  onClose: () => void
}

export function ProfileChatPanel({
  open,
  conversationId,
  creatorName,
  creatorHandle,
  creatorAvatar,
  pricePerMessage = 49,
  initialSession = null,
  onSessionChange,
  onClose,
}: ProfileChatPanelProps) {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [session, setSession] = useState<ChatSession | null>(initialSession)
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
    initialSession?.remainingSeconds ?? null
  )
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null)
  const [recording, setRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  const recordingStartedAtRef = useRef(0)
  const pendingMediaRef = useRef<PendingMedia | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const outgoingType = pendingMedia?.type ?? 'TEXT'
  const price =
    session?.mode === 'PER_ITEM'
      ? itemPriceFromSession(session, outgoingType)
      : session?.mode === 'FIXED_DURATION' || session?.mode === 'PER_MINUTE'
        ? 0
        : Math.max(1, Number(pricePerMessage) || 49)
  const sessionEnded =
    session?.status === 'ENDED' ||
    session?.status === 'EXPIRED' ||
    (session?.mode === 'FIXED_DURATION' &&
      remainingSeconds != null &&
      remainingSeconds <= 0)
  const canAfford =
    sessionEnded
      ? false
      : session?.mode === 'FIXED_DURATION' || session?.mode === 'PER_MINUTE'
        ? true
        : balance == null || balance >= price

  const onSessionChangeRef = useRef(onSessionChange)
  onSessionChangeRef.current = onSessionChange

  function applySession(next: ChatSession | null) {
    setSession(next)
    setRemainingSeconds(next?.remainingSeconds ?? null)
    onSessionChangeRef.current?.(next)
  }

  function replacePendingMedia(next: PendingMedia | null) {
    const previous = pendingMediaRef.current
    if (previous && previous.previewUrl !== next?.previewUrl) {
      URL.revokeObjectURL(previous.previewUrl)
    }
    pendingMediaRef.current = next
    setPendingMedia(next)
  }

  function releaseMicrophone() {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    recordingStreamRef.current = null
    recorderRef.current = null
    setRecording(false)
  }

  async function refreshBalance() {
    try {
      const b = await fetchWalletAvailableBalance()
      setBalance(b)
      return b
    } catch {
      return null
    }
  }

  useEffect(() => {
    applySession(initialSession)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when parent purchases a plan
  }, [initialSession?.id])

  useEffect(() => {
    if (!open || !conversationId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [items, active] = await Promise.all([
          api<ChatMessage[]>(
            `/chat/conversations/${conversationId}/messages?page=1&limit=50`
          ),
          api<{ session: ChatSession | null }>(
            `/chat/conversations/${conversationId}/session`
          ).catch(() => ({ session: null })),
          refreshBalance(),
        ])
        if (!cancelled) {
          setMessages(Array.isArray(items) ? items : [])
          if (active.session) applySession(active.session)
          else if (initialSession) applySession(initialSession)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'Failed to load messages'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, conversationId])

  useEffect(() => {
    if (!open || !conversationId) return
    const socket = connectChatSocket()
    if (!socket) return
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('conversation:join', { conversationId })
    })
    socket.on(
      'message:new',
      (payload: {
        conversationId?: string
        message?: ChatMessage
        id?: string
      }) => {
        const message = payload.message ?? (payload as ChatMessage)
        if (
          payload.conversationId &&
          payload.conversationId !== conversationId
        ) {
          return
        }
        setMessages((current) => appendUnique(current, message))
      }
    )

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [open, conversationId])

  useEffect(() => {
    if (!open || !session?.id) return
    if (session.mode !== 'FIXED_DURATION' && session.mode !== 'PER_MINUTE') {
      return
    }
    const tick = window.setInterval(() => {
      void (async () => {
        try {
          const res = await api<{ session: ChatSession }>(
            `/chat/sessions/${session.id}`
          )
          applySession(res.session)
          if (
            res.session.status === 'ENDED' ||
            res.session.status === 'EXPIRED'
          ) {
            setError('Chat session ended. Buy another plan to continue.')
          }
        } catch {
          // ignore transient poll errors
        }
      })()
      if (session.mode === 'FIXED_DURATION') {
        setRemainingSeconds((prev) =>
          prev == null ? prev : Math.max(0, prev - 1)
        )
      }
    }, 1000)
    return () => window.clearInterval(tick)
  }, [open, session?.id, session?.mode])

  useEffect(() => {
    if (!open) return
    const node = listRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, open])

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 180)
      return () => window.clearTimeout(t)
    }
  }, [open, conversationId])

  useEffect(() => {
    if (!recording) return
    const timer = window.setInterval(() => {
      setRecordingSeconds(
        Math.floor((Date.now() - recordingStartedAtRef.current) / 1000)
      )
    }, 250)
    return () => window.clearInterval(timer)
  }, [recording])

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current
      if (recorder?.state === 'recording') {
        recorder.onstop = null
        recorder.stop()
      }
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
      if (pendingMediaRef.current) {
        URL.revokeObjectURL(pendingMediaRef.current.previewUrl)
      }
    }
  }, [])

  function selectImage(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    replacePendingMedia({
      file,
      type: 'IMAGE',
      previewUrl: URL.createObjectURL(file),
    })
    setError(null)
  }

  async function startRecording() {
    if (sending || !canAfford) return
    if (
      typeof MediaRecorder === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError('Voice recording is not supported in this browser.')
      return
    }

    const mimeType = ['audio/mp4', 'audio/webm', 'audio/ogg'].find((type) =>
      MediaRecorder.isTypeSupported(type)
    )
    if (!mimeType) {
      setError('This browser does not support a compatible voice-note format.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType })
      recordingStreamRef.current = stream
      recorderRef.current = recorder
      recordingChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - recordingStartedAtRef.current) / 1000)
        )
        const extension =
          mimeType === 'audio/mp4'
            ? 'm4a'
            : mimeType === 'audio/ogg'
              ? 'ogg'
              : 'webm'
        const blob = new Blob(recordingChunksRef.current, { type: mimeType })
        const file = new File(
          [blob],
          `voice-note-${Date.now()}.${extension}`,
          { type: mimeType }
        )
        replacePendingMedia({
          file,
          type: 'AUDIO',
          previewUrl: URL.createObjectURL(blob),
          durationSeconds,
        })
        recordingChunksRef.current = []
        releaseMicrophone()
      }
      recordingStartedAtRef.current = Date.now()
      setRecordingSeconds(0)
      setRecording(true)
      setError(null)
      recorder.start(250)
    } catch {
      releaseMicrophone()
      setError('Microphone access is required to record a voice note.')
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') recorder.stop()
  }

  async function endSession() {
    if (!session?.id) return
    try {
      const res = await api<{ session: ChatSession }>(
        `/chat/sessions/${session.id}/end`,
        { method: 'POST' }
      )
      applySession(res.session)
      setError('Session ended.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not end session')
    }
  }

  async function send() {
    const text = draft.trim()
    const attachment = pendingMedia
    if ((!text && !attachment) || !conversationId || sending || recording) return
    if (sessionEnded) {
      setError('Chat session ended. Buy another plan to continue.')
      return
    }

    const currentBalance = balance ?? (await refreshBalance()) ?? 0
    if (
      (session?.mode === 'PER_ITEM' || !session) &&
      currentBalance < price
    ) {
      setError(
        `Need ${formatCurrency(price)} in wallet to send. Add funds first.`
      )
      setBalance(currentBalance)
      return
    }

    setSending(true)
    setError(null)
    try {
      let mediaKey: string | undefined
      let mediaUrl: string | null = null
      if (attachment) {
        const upload = await uploadMediaFile({
          file: attachment.file,
          purpose: 'CHAT',
          type: attachment.type,
        })
        mediaKey = upload.asset.storageKey
        mediaUrl = upload.url
        if (!mediaKey) throw new Error('Upload did not return a media key')
      }

      const messageType = attachment?.type ?? 'TEXT'
      const res = await api<{
        message: ChatMessage
        replyMessage?: ChatMessage | null
        session?: ChatSession | null
      }>(`/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          type: messageType,
          ...(text ? { body: text } : {}),
          ...(mediaKey ? { mediaKey } : {}),
          ...(session?.id ? { sessionId: session.id } : {}),
          idempotencyKey: `web-${conversationId}-${Date.now()}`,
        }),
      })
      const message = res.message ?? (res as unknown as ChatMessage)
      if (mediaUrl && !message.mediaUrl) message.mediaUrl = mediaUrl
      setMessages((prev) => {
        let next = appendUnique(prev, message)
        next = appendUnique(next, res.replyMessage)
        return next
      })
      if (res.session) applySession(res.session)
      setDraft('')
      replacePendingMedia(null)
      await refreshBalance()
    } catch (err) {
      const msg =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Failed to send'
      setError(msg)
      await refreshBalance()
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {open && conversationId ? (
        <motion.div
          role="dialog"
          aria-label={`Chat with ${creatorName} (@${creatorHandle})`}
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 24, scale: 0.96 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 16, scale: 0.98 }
          }
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'fixed z-[90] flex flex-col overflow-hidden border border-white/12 bg-[#0f0f14]/96 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl',
            expanded
              ? 'inset-3 rounded-[22px] sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(720px,86vh)] sm:w-[min(440px,92vw)]'
              : 'right-3 bottom-3 h-[min(520px,70vh)] w-[min(360px,calc(100vw-1.5rem))] rounded-t-[18px] rounded-b-[14px] sm:right-6 sm:bottom-6'
          )}
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.04] px-3 py-2.5">
            <NextImage
              src={creatorAvatar}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full object-cover ring-1 ring-white/15"
              unoptimized={
                creatorAvatar.includes('dicebear.com') ||
                creatorAvatar.endsWith('.svg')
              }
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-white">
                {creatorName}
              </p>
              <p className="truncate text-[11px] text-white/45">
                {session
                  ? session.mode === 'FIXED_DURATION'
                    ? `${planModeLabel(session.mode)} · ${formatDuration(remainingSeconds ?? 0)} left`
                    : session.mode === 'PER_MINUTE'
                      ? `${planModeLabel(session.mode)} · ${formatCurrency(Number(session.pricePerMinute ?? 0))}/min · charged ${session.minutesCharged}m`
                      : `Text ${formatCurrency(Number(session.textPrice ?? 0))} · Img ${formatCurrency(Number(session.imagePrice ?? 0))} · Voice ${formatCurrency(Number(session.audioPrice ?? 0))}`
                  : `${formatCurrency(price)}/msg`}
                {balance != null ? ` · Wallet ${formatCurrency(balance)}` : ''}
              </p>
            </div>
            {session &&
            (session.mode === 'FIXED_DURATION' ||
              session.mode === 'PER_MINUTE') &&
            (session.status === 'PENDING' || session.status === 'ACTIVE') ? (
              <button
                type="button"
                onClick={() => void endSession()}
                className="rounded-full px-2 py-1 text-[11px] font-semibold text-rose-300 hover:bg-white/10"
              >
                End
              </button>
            ) : null}
            <button
              type="button"
              aria-label={expanded ? 'Minimize chat' : 'Expand chat'}
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white"
            >
              {expanded ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>
            <button
              type="button"
              aria-label="Close chat"
              onClick={onClose}
              className="rounded-full p-2 text-white/55 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3"
          >
            {loading ? (
              <p className="py-8 text-center text-[13px] text-white/40">
                Loading chat…
              </p>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <p className="text-[14px] font-medium text-white/80">
                  Say hello to {creatorName.split(' ')[0]}
                </p>
                <p className="mt-1 text-[12px] text-white/40">
                  {session?.mode === 'FIXED_DURATION'
                    ? 'Your package includes text, images, and voice notes until time runs out.'
                    : session?.mode === 'PER_MINUTE'
                      ? 'Per-minute billing starts on your first message. Media is included.'
                      : session?.mode === 'PER_ITEM'
                        ? `This send costs ${formatCurrency(price)} from your wallet.`
                        : `Each message costs ${formatCurrency(price)} from your wallet.`}
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === user?.id
                const text = m.body || m.content || ''
                const charged = Number(m.amountCharged ?? 0)
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
                      mine
                        ? 'ml-auto rounded-br-md bg-sky-500 text-white'
                        : 'rounded-bl-md bg-white/[0.08] text-white/90'
                    )}
                  >
                    {m.type === 'IMAGE' && m.mediaUrl ? (
                      <a
                        href={m.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        {/* Chat media can be served from user-configured storage hosts. */}
                        <img
                          src={m.mediaUrl}
                          alt={text || 'Shared image'}
                          className="max-h-64 w-full rounded-xl object-cover"
                        />
                      </a>
                    ) : null}
                    {m.type === 'AUDIO' && m.mediaUrl ? (
                      <audio
                        src={m.mediaUrl}
                        controls
                        preload="metadata"
                        className="h-9 max-w-full"
                      >
                        <track kind="captions" />
                      </audio>
                    ) : null}
                    {text ? (
                      <p
                        className={cn(
                          (m.type === 'IMAGE' || m.type === 'AUDIO') && 'mt-2'
                        )}
                      >
                        {text}
                      </p>
                    ) : null}
                    {!text && m.mediaKey && !m.mediaUrl ? (
                      <p className="text-white/60">
                        {m.type === 'AUDIO' ? 'Voice note' : 'Image'}
                      </p>
                    ) : null}
                    {mine && charged > 0 ? (
                      <p className="mt-1 text-[10px] text-white/70">
                        −{formatCurrency(charged)}
                      </p>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>

          {error ? (
            <div className="shrink-0 space-y-1 px-3 pb-1">
              <p className="text-[11px] text-red-300">{error}</p>
              {!canAfford ? (
                <Link
                  href="/user/wallet"
                  className="text-[11px] font-medium text-sky-300 underline"
                >
                  Add funds to wallet →
                </Link>
              ) : null}
            </div>
          ) : null}

          <footer className="shrink-0 border-t border-white/10 bg-black/30 p-2.5">
            {!canAfford ? (
              <div className="mb-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-100">
                Insufficient balance. Need {formatCurrency(price)} per message.{' '}
                <Link href="/user/wallet" className="font-semibold underline">
                  Top up wallet
                </Link>
              </div>
            ) : null}
            {pendingMedia ? (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] p-2">
                {pendingMedia.type === 'IMAGE' ? (
                  <img
                    src={pendingMedia.previewUrl}
                    alt="Selected attachment"
                    className="size-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <audio
                      src={pendingMedia.previewUrl}
                      controls
                      preload="metadata"
                      className="h-8 min-w-0 flex-1"
                    >
                      <track kind="captions" />
                    </audio>
                    <span className="shrink-0 text-[11px] text-white/50">
                      {formatDuration(pendingMedia.durationSeconds ?? 0)}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  aria-label="Remove attachment"
                  disabled={sending}
                  onClick={() => replacePendingMedia(null)}
                  className="ml-auto rounded-full p-1.5 text-white/55 hover:bg-white/10 hover:text-white disabled:opacity-40"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : null}
            {recording ? (
              <div className="mb-2 flex items-center gap-2 px-1 text-[12px] text-red-300">
                <span className="size-2 animate-pulse rounded-full bg-red-400" />
                Recording {formatDuration(recordingSeconds)}
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  selectImage(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              <button
                type="button"
                disabled={sending || recording || !canAfford}
                onClick={() => imageInputRef.current?.click()}
                aria-label="Attach image"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <ImagePlus className="size-4" />
              </button>
              <button
                type="button"
                disabled={sending || !canAfford}
                onClick={() =>
                  recording ? stopRecording() : void startRecording()
                }
                aria-label={recording ? 'Stop recording' : 'Record voice note'}
                className={cn(
                  'inline-flex size-9 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40',
                  recording
                    ? 'bg-red-500 text-white hover:bg-red-400'
                    : 'text-white/55 hover:bg-white/10 hover:text-white'
                )}
              >
                {recording ? (
                  <Square className="size-3.5 fill-current" />
                ) : (
                  <Mic className="size-4" />
                )}
              </button>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  canAfford
                    ? `Message (${formatCurrency(price)})…`
                    : 'Add funds to send…'
                }
                disabled={!canAfford || recording || sending}
                className="h-10 flex-1 rounded-full border border-white/10 bg-white/[0.06] px-3.5 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-white/25 disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
              />
              <button
                type="button"
                disabled={
                  sending ||
                  recording ||
                  (!draft.trim() && !pendingMedia) ||
                  !canAfford
                }
                onClick={() => void send()}
                aria-label="Send message"
                className="inline-flex size-10 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-400 disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>
            {sending ? (
              <p className="mt-1.5 px-1 text-[11px] text-white/40">
                {pendingMedia ? 'Uploading and sending…' : 'Sending…'}
              </p>
            ) : null}
          </footer>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
