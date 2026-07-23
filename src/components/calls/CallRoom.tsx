'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import { Mic, MicOff, PhoneOff, SwitchCamera } from 'lucide-react'
import type { Socket } from 'socket.io-client'

import { api } from '@/lib/api'
import { flipCameraTrack } from '@/lib/agora-camera'
import {
  connectCallSocket,
  type AgoraPayload,
} from '@/lib/call-socket'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'

export type { AgoraPayload }

interface CallSessionResponse {
  call: {
    id: string
    status: string
    type: string
    pricePerMinute: string
    currency: string
  }
  agora?: AgoraPayload
}

interface CallRoomProps {
  callId: string
  /** Caller waits for accept; callee joins after accepting. */
  role: 'caller' | 'callee'
  /** Optional credentials from accept/create so we can join without a second GET. */
  initialAgora?: AgoraPayload | null
  initialCallType?: 'AUDIO' | 'VIDEO'
  initialPricePerMinute?: number | null
  onEnd: () => void
  /**
   * Caller only: influencer accepted a different session (e.g. after a
   * duplicate dial). Switch this tab onto that live session.
   */
  onAdoptSession?: (sessionId: string) => void
}

function mediaErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  const lower = msg.toLowerCase()
  if (
    lower.includes('permission') ||
    lower.includes('notallowed') ||
    lower.includes('denied')
  ) {
    return 'Microphone permission is required for the call'
  }
  if (lower.includes('device') || lower.includes('notfound')) {
    return 'No microphone found. Plug one in and try again.'
  }
  return msg || 'Could not join call'
}

export function CallRoom({
  callId,
  role,
  initialAgora = null,
  initialCallType,
  initialPricePerMinute = null,
  onEnd,
  onAdoptSession,
}: CallRoomProps) {
  const [phase, setPhase] = useState<'ringing' | 'connecting' | 'active' | 'ended'>(
    role === 'caller' ? 'ringing' : 'connecting'
  )
  const [elapsed, setElapsed] = useState(0)
  const [pricePerMinute, setPricePerMinute] = useState<number | null>(
    initialPricePerMinute
  )
  const [callType, setCallType] = useState<'AUDIO' | 'VIDEO'>(
    initialCallType ?? 'VIDEO'
  )
  const [muted, setMuted] = useState(false)
  const [flipBusy, setFlipBusy] = useState(false)
  const [remoteConnected, setRemoteConnected] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const localRef = useRef<HTMLDivElement>(null)
  const remoteRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const videoTrackRef = useRef<ICameraVideoTrack | null>(null)
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const joinedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onEndRef = useRef(onEnd)
  const onAdoptSessionRef = useRef(onAdoptSession)
  onEndRef.current = onEnd
  onAdoptSessionRef.current = onAdoptSession

  function startTimer() {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1)
    }, 1000)
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    let poll: ReturnType<typeof setInterval> | undefined
    let mounted = true
    // Bumps on cleanup so in-flight Strict Mode joins are abandoned.
    let joinGeneration = 0

    async function playRemoteUser(
      client: IAgoraRTCClient,
      user: IAgoraRTCRemoteUser,
      publishedType?: 'audio' | 'video'
    ) {
      const types: Array<'audio' | 'video'> = publishedType
        ? [publishedType]
        : [
            ...(user.hasAudio ? (['audio'] as const) : []),
            ...(user.hasVideo ? (['video'] as const) : []),
          ]

      for (const type of types) {
        await client.subscribe(user, type)
        if (type === 'video' && remoteRef.current) {
          user.videoTrack?.play(remoteRef.current)
        }
        if (type === 'audio') {
          user.audioTrack?.play()
        }
      }
      if (mounted) setRemoteConnected(true)
    }

    async function joinAgora(
      agora: AgoraPayload,
      mediaType: 'AUDIO' | 'VIDEO'
    ): Promise<boolean> {
      if (!mounted || joinedRef.current) return joinedRef.current
      const generation = ++joinGeneration
      joinedRef.current = true
      setPhase('connecting')
      setError(null)

      const stillCurrent = () => mounted && generation === joinGeneration

      try {
        if (agora.mock || agora.appId === 'agora_app_stub') {
          if (!stillCurrent()) return false
          setPhase('active')
          setMicReady(true)
          startTimer()
          return true
        }

        // Dynamic import — agora-rtc-sdk-ng touches `window` and must not run on SSR.
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
        if (!stillCurrent()) return false

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        clientRef.current = client

        client.on('user-published', (user, publishedType) => {
          if (publishedType !== 'audio' && publishedType !== 'video') return
          void playRemoteUser(client, user, publishedType).catch(() => {
            // remote subscribe can fail transiently; keep call alive
          })
        })
        client.on('user-unpublished', () => {
          if (!stillCurrent()) return
          const stillLive = client.remoteUsers.some(
            (u) => u.hasAudio || u.hasVideo
          )
          setRemoteConnected(stillLive)
        })
        client.on('user-left', () => {
          if (!stillCurrent()) return
          setRemoteConnected(client.remoteUsers.length > 0)
        })

        await client.join(
          agora.appId,
          agora.channel,
          agora.token || null,
          agora.uid ?? null
        )
        if (!stillCurrent()) {
          await client.leave().catch(() => undefined)
          return false
        }

        // Channel joined → call is live. Start timer immediately so admin
        // doesn't stay stuck on "Connecting…" while mic permission resolves.
        setPhase('active')
        startTimer()

        // Catch peers who published before our listeners were ready.
        for (const user of client.remoteUsers) {
          await playRemoteUser(client, user)
        }
        if (!stillCurrent()) return false

        if (mediaType === 'AUDIO') {
          const micTrack = await AgoraRTC.createMicrophoneAudioTrack()
          if (!stillCurrent()) {
            micTrack.close()
            return false
          }
          audioTrackRef.current = micTrack
          await client.publish([micTrack])
        } else {
          try {
            const [micTrack, camTrack] =
              await AgoraRTC.createMicrophoneAndCameraTracks()
            if (!stillCurrent()) {
              micTrack.close()
              camTrack.close()
              return false
            }
            audioTrackRef.current = micTrack
            videoTrackRef.current = camTrack
            if (localRef.current) camTrack.play(localRef.current)
            await client.publish([micTrack, camTrack])
          } catch {
            // Camera denied / missing — still connect as voice.
            const micTrack = await AgoraRTC.createMicrophoneAudioTrack()
            if (!stillCurrent()) {
              micTrack.close()
              return false
            }
            audioTrackRef.current = micTrack
            await client.publish([micTrack])
            setCallType('AUDIO')
          }
        }

        if (stillCurrent()) setMicReady(true)
        return true
      } catch (err) {
        if (stillCurrent()) {
          joinedRef.current = false
          throw err
        }
        return false
      }
    }

    async function tryActivate(seed?: CallSessionResponse | null) {
      const data =
        seed ?? (await api<CallSessionResponse>(`/calls/sessions/${callId}`))
      if (!mounted) return true

      const price = Number(data.call.pricePerMinute)
      setPricePerMinute(Number.isFinite(price) && price > 0 ? price : null)
      const mediaType = data.call.type === 'AUDIO' ? 'AUDIO' : 'VIDEO'
      setCallType(mediaType)

      if (
        data.call.status === 'ENDED' ||
        data.call.status === 'REJECTED' ||
        data.call.status === 'CANCELLED' ||
        data.call.status === 'MISSED' ||
        data.call.status === 'FAILED'
      ) {
        // This session died — but the creator may have answered a sibling dial.
        if (role === 'caller' && onAdoptSessionRef.current) {
          const adopted = await findActiveCallerSession(callId)
          if (adopted) {
            onAdoptSessionRef.current(adopted)
            return true
          }
        }
        setPhase('ended')
        setError(`Call ${data.call.status.toLowerCase()}`)
        return true
      }

      if (data.call.status === 'ACTIVE' && data.agora) {
        const ok = await joinAgora(data.agora, mediaType)
        // Only stop polling once we actually joined (or already joined).
        return ok || joinedRef.current
      }

      // Still ringing: recover if creator already accepted another session.
      if (
        role === 'caller' &&
        data.call.status === 'RINGING' &&
        onAdoptSessionRef.current
      ) {
        const adopted = await findActiveCallerSession(callId)
        if (adopted) {
          onAdoptSessionRef.current(adopted)
          return true
        }
      }
      return false
    }

    async function findActiveCallerSession(
      exceptId: string
    ): Promise<string | null> {
      try {
        const items = await api<Array<{ id: string; status: string }>>(
          '/calls/sessions/me?page=1&limit=10&status=ACTIVE'
        )
        const list = Array.isArray(items) ? items : []
        const live = list.find(
          (item) => item.status === 'ACTIVE' && item.id !== exceptId
        )
        return live?.id ?? null
      } catch {
        return null
      }
    }

    async function bootstrap() {
      try {
        const socket = connectCallSocket()
        socketRef.current = socket
        if (socket) {
          socket.emit('call:join', { sessionId: callId })
          if (role === 'caller') {
            socket.emit('call:invite', { sessionId: callId })
          }
          socket.on(
            'call:accepted',
            (payload?: { call?: { id?: string } }) => {
              const acceptedId = payload?.call?.id
              if (acceptedId && acceptedId !== callId) {
                // Creator answered a parallel/older dial — follow that session.
                onAdoptSessionRef.current?.(acceptedId)
                return
              }
              void tryActivate().catch((err) => {
                if (!mounted || joinedRef.current) return
                setError(mediaErrorMessage(err))
              })
            }
          )
          socket.on(
            'call:ended',
            (payload?: { call?: { id?: string } }) => {
              const endedId = payload?.call?.id
              if (endedId && endedId !== callId) return
              setPhase('ended')
              stopTimer()
              onEndRef.current()
            }
          )
          socket.on('billing:exhausted', (payload: { reason?: string }) => {
            setError(payload.reason || 'Wallet balance exhausted')
            setPhase('ended')
            stopTimer()
          })
        }

        // Callee: prefer credentials from accept so we don't depend on a second GET.
        if (role === 'callee' && initialAgora && !joinedRef.current) {
          try {
            const ok = await joinAgora(
              initialAgora,
              initialCallType ?? callType
            )
            if (ok) return
          } catch {
            joinedRef.current = false
            if (mounted) {
              setError(null)
              setPhase('connecting')
            }
          }
        }

        let activated = false
        try {
          activated = await tryActivate()
        } catch {
          activated = false
        }

        if (!activated && !joinedRef.current) {
          let attempts = 0
          const maxAttempts = role === 'caller' ? 45 : 12
          poll = setInterval(() => {
            attempts += 1
            void tryActivate()
              .then((done) => {
                if (done && poll) clearInterval(poll)
              })
              .catch((err) => {
                if (!mounted || joinedRef.current) return
                if (attempts >= maxAttempts) {
                  setError(mediaErrorMessage(err))
                  setPhase('ended')
                  if (poll) clearInterval(poll)
                }
              })
          }, 2500)
        }
      } catch (err) {
        if (!mounted) return
        setError(mediaErrorMessage(err))
        setPhase('ended')
      }
    }

    void bootstrap()

    return () => {
      mounted = false
      joinGeneration += 1
      joinedRef.current = false
      if (poll) clearInterval(poll)
      stopTimer()
      socketRef.current?.disconnect()
      socketRef.current = null
      videoTrackRef.current?.close()
      audioTrackRef.current?.close()
      videoTrackRef.current = null
      audioTrackRef.current = null
      const client = clientRef.current
      clientRef.current = null
      void client?.leave()
    }
    // initialAgora is only used on first mount for this callId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId, role])

  async function handleEnd() {
    try {
      await api(`/calls/sessions/${callId}/end`, { method: 'POST' })
    } catch {
      // still leave local media
    }
    stopTimer()
    videoTrackRef.current?.close()
    audioTrackRef.current?.close()
    await clientRef.current?.leave()
    setPhase('ended')
    onEnd()
  }

  async function handleCancel() {
    try {
      await api(`/calls/sessions/${callId}/cancel`, { method: 'POST' })
    } catch {
      // ignore
    }
    stopTimer()
    setPhase('ended')
    onEnd()
  }

  async function toggleMute() {
    const track = audioTrackRef.current
    if (!track) return
    const next = !muted
    await track.setEnabled(!next)
    setMuted(next)
  }

  async function handleFlipCamera() {
    if (flipBusy || callType !== 'VIDEO') return
    const cam = videoTrackRef.current
    if (!cam) return
    setFlipBusy(true)
    try {
      const result = await flipCameraTrack(cam)
      if (!result.ok) {
        console.warn('Flip camera:', result.message)
        return
      }
      if (localRef.current) {
        localRef.current.replaceChildren()
        cam.play(localRef.current)
      }
    } catch (err) {
      console.error('Failed to flip camera', err)
    } finally {
      setFlipBusy(false)
    }
  }

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-white/80">
          {phase === 'ringing'
            ? 'Calling…'
            : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
        </span>
        <span className="text-xs text-white/45">
          {pricePerMinute != null
            ? `${formatCurrency(pricePerMinute)}/min from wallet`
            : 'Billed per minute from wallet'}
        </span>
      </div>

      <div className="relative flex-1">
        <div ref={remoteRef} className="absolute inset-0 bg-[#0b0b0f]" />
        {phase === 'active' && callType === 'VIDEO' ? (
          <div
            ref={localRef}
            className="absolute bottom-4 right-4 h-36 w-28 overflow-hidden rounded-xl border border-white/20 bg-black/40"
          />
        ) : null}
        {phase === 'active' && callType === 'AUDIO' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex size-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-lg font-semibold text-white">
              Voice
            </div>
            <p className="text-sm text-white/55">
              {!micReady
                ? 'Allow microphone access to talk'
                : remoteConnected
                  ? 'Connected — talk like a normal phone call'
                  : 'Connected — waiting for the other person…'}
            </p>
          </div>
        ) : null}
        {phase === 'ringing' || phase === 'connecting' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
            <p className="text-lg font-semibold">
              {phase === 'ringing' ? 'Waiting for creator…' : 'Connecting…'}
            </p>
            <p className="text-sm text-white/50">
              {phase === 'connecting'
                ? 'Joining the call room…'
                : 'Keep this screen open. Billing starts when the call connects.'}
            </p>
          </div>
        ) : null}
        {phase === 'ended' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <p className="text-lg font-semibold">Call ended</p>
            {error ? <p className="text-sm text-white/50">{error}</p> : null}
            <Button onClick={onEnd}>Close</Button>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center gap-3 p-6">
        {phase === 'ringing' ? (
          <Button
            variant="secondary"
            onClick={() => void handleCancel()}
            className="gap-2 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5" />
            Cancel
          </Button>
        ) : null}
        {phase === 'connecting' || phase === 'active' ? (
          <>
            {phase === 'active' && micReady ? (
              <Button
                variant="secondary"
                onClick={() => void toggleMute()}
                className="gap-2 bg-white/10 hover:bg-white/20"
              >
                {muted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
                {muted ? 'Unmute' : 'Mute'}
              </Button>
            ) : null}
            {phase === 'active' && callType === 'VIDEO' ? (
              <Button
                variant="secondary"
                disabled={flipBusy}
                onClick={() => void handleFlipCamera()}
                className="gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50"
              >
                <SwitchCamera className="h-5 w-5" />
                {flipBusy ? 'Flipping…' : 'Flip'}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => void handleEnd()}
              className={cn('gap-2 bg-red-600 hover:bg-red-700')}
            >
              <PhoneOff className="h-5 w-5" />
              End Call
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
