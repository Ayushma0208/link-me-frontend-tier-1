'use client'

import { useEffect, useRef, useState } from 'react'
import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import { Coffee, Play, Radio, X } from 'lucide-react'
import {
  getLive,
  isMockAgora,
  pauseCreatorLive,
  resumeCreatorLive,
  type AgoraCreds,
  type LiveDto,
  type PauseLiveInput,
} from '@/lib/live'
import {
  connectLiveSocket,
  type LiveBrbPayload,
} from '@/lib/live-socket'
import { LiveChatOverlay } from '@/components/live/LiveChatOverlay'

interface LiveRoomProps {
  creds: AgoraCreds
  title: string
  subtitle?: string
  /** Used by viewers to poll when the creator ends / pauses the session. */
  liveId?: string
  /** Admin-set price per emoji reaction (viewers). */
  emojiPrice?: number | null
  /** Seed BRB state when host re-enters an already-paused live. */
  initialPaused?: boolean
  initialBrbMessage?: string | null
  initialBrbImageUrl?: string | null
  onLeave: () => void
  /** Called after the ended message is shown (viewers → redirect home). */
  onEnded?: () => void
  /** Host-only end action (also ends the session server-side). */
  onEnd?: () => void
  /** Override pause API (e.g. admin host). Defaults to creator self-service. */
  onPause?: (input: PauseLiveInput) => Promise<{ live: LiveDto }>
  /** Override resume API (e.g. admin host). Defaults to creator self-service. */
  onResume?: () => Promise<{ live: LiveDto }>
}

function containerHasVideo(el: HTMLElement | null): boolean {
  if (!el) return false
  const vid = el.querySelector('video')
  if (!vid) return false
  // Agora may inject the element before frames arrive — still treat as live UI.
  return true
}

export function LiveRoom({
  creds,
  title,
  subtitle,
  liveId,
  emojiPrice = null,
  initialPaused = false,
  initialBrbMessage = null,
  initialBrbImageUrl = null,
  onLeave,
  onEnded,
  onEnd,
  onPause,
  onResume,
}: LiveRoomProps) {
  const isHost = creds.role === 'host'
  const [status, setStatus] = useState<
    'connecting' | 'live' | 'waiting' | 'ended'
  >('connecting')
  const [hasVideoEl, setHasVideoEl] = useState(false)
  const [isPaused, setIsPaused] = useState(initialPaused)
  const [brbMessage, setBrbMessage] = useState(
    initialBrbMessage ?? 'Be right back'
  )
  const [brbImageUrl, setBrbImageUrl] = useState<string | null>(
    initialBrbImageUrl
  )
  const [brbBusy, setBrbBusy] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const camRef = useRef<ICameraVideoTrack | null>(null)
  const micRef = useRef<IMicrophoneAudioTrack | null>(null)
  const endedRef = useRef(false)

  function applyBrb(payload: {
    isPaused: boolean
    brbMessage?: string | null
    brbImageUrl?: string | null
  }) {
    setIsPaused(payload.isPaused)
    if (payload.isPaused) {
      setBrbMessage(payload.brbMessage?.trim() || 'Be right back')
      setBrbImageUrl(payload.brbImageUrl ?? null)
    } else {
      setBrbMessage('Be right back')
      setBrbImageUrl(null)
    }
  }

  async function setLocalTracksEnabled(enabled: boolean) {
    try {
      await Promise.all([
        camRef.current?.setEnabled(enabled),
        micRef.current?.setEnabled(enabled),
      ])
    } catch (err) {
      console.error('Failed to toggle live tracks', err)
    }
  }

  function markEnded() {
    if (endedRef.current) return
    endedRef.current = true
    setIsPaused(false)
    setStatus('ended')
  }

  function markLive() {
    if (endedRef.current) return
    setHasVideoEl(true)
    setStatus('live')
  }

  // Watch the player DOM — if Agora put a <video> in, clear the waiting overlay.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const sync = () => {
      if (endedRef.current) return
      if (containerHasVideo(el)) markLive()
      else setHasVideoEl(false)
    }

    sync()
    const obs = new MutationObserver(sync)
    obs.observe(el, { childList: true, subtree: true, attributes: true })
    const interval = setInterval(sync, 400)
    return () => {
      obs.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Viewers: poll API so we detect end / BRB even if Agora or socket miss.
  useEffect(() => {
    if (!liveId) return
    let cancelled = false

    const tick = async () => {
      try {
        const details = await getLive(liveId)
        if (cancelled) return
        if (details.live.status === 'ENDED') {
          markEnded()
          return
        }
        if (!isHost) {
          applyBrb({
            isPaused: Boolean(details.live.isPaused),
            brbMessage: details.live.brbMessage,
            brbImageUrl: details.live.brbImageUrl,
          })
        }
      } catch {
        // ignore transient errors
      }
    }

    void tick()
    const interval = setInterval(() => void tick(), 2500)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isHost, liveId])

  // Real-time BRB updates via the live chat socket room.
  useEffect(() => {
    if (!liveId) return
    const socket = connectLiveSocket()
    if (!socket) return

    const onBrb = (payload: LiveBrbPayload) => {
      if (payload.liveId !== liveId) return
      applyBrb(payload)
      if (isHost) {
        void setLocalTracksEnabled(!payload.isPaused)
      }
    }

    socket.emit('live:join', { liveId })
    socket.on('live:brb', onBrb)

    return () => {
      socket.off('live:brb', onBrb)
      socket.disconnect()
    }
  }, [isHost, liveId])

  // After showing "Live is ended", redirect viewers home.
  useEffect(() => {
    if (status !== 'ended' || isHost) return
    const timer = setTimeout(() => {
      void cleanup().then(() => {
        ;(onEnded ?? onLeave)()
      })
    }, 2200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to ended
  }, [status, isHost])

  useEffect(() => {
    let mounted = true
    let stuckTimer: number | undefined
    const mock = isMockAgora(creds)

    /** Once join is granted, the viewer is in the room — never trap on "connecting". */
    function enterRoom(opts?: { paused?: boolean }) {
      if (!mounted || endedRef.current) return
      setStatus('live')
      if (opts?.paused || initialPaused) {
        applyBrb({
          isPaused: true,
          brbMessage: initialBrbMessage,
          brbImageUrl: initialBrbImageUrl,
        })
      }
    }

    async function start() {
      // Safety: if Agora hangs, still enter the room so leave/rejoin never sticks.
      stuckTimer = window.setTimeout(() => {
        enterRoom()
      }, 2500)

      // Demo / missing Agora: join API already proved the session is live.
      if (mock) {
        window.clearTimeout(stuckTimer)
        setHasVideoEl(true)
        enterRoom()
        return
      }

      try {
        const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
        clientRef.current = client
        await client.setClientRole(isHost ? 'host' : 'audience')

        const playRemoteVideo = (user: {
          videoTrack?: { play: (el: HTMLElement) => void } | null
        }) => {
          if (!videoRef.current || !user.videoTrack) return
          user.videoTrack.play(videoRef.current)
          if (mounted) markLive()
        }

        client.on('user-published', async (user, mediaType) => {
          try {
            await client.subscribe(user, mediaType)
            if (mediaType === 'video') playRemoteVideo(user)
            if (mediaType === 'audio') user.audioTrack?.play()
          } catch (err) {
            console.error('Agora subscribe failed', err)
          }
        })

        client.on('user-left', () => {})
        client.on('user-unpublished', () => {})

        await client.join(
          creds.appId,
          creds.channel,
          creds.token,
          typeof creds.uid === 'number' ? creds.uid : Number(creds.uid) || null
        )

        if (isHost) {
          const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks()
          micRef.current = mic
          camRef.current = cam
          if (videoRef.current) cam.play(videoRef.current)
          await client.publish([mic, cam])
          if (initialPaused) {
            await setLocalTracksEnabled(false)
          }
          window.clearTimeout(stuckTimer)
          if (mounted) markLive()
        } else {
          for (const user of client.remoteUsers) {
            try {
              if (user.hasVideo) {
                await client.subscribe(user, 'video')
                playRemoteVideo(user)
              }
              if (user.hasAudio) {
                await client.subscribe(user, 'audio')
                user.audioTrack?.play()
              }
            } catch (err) {
              console.error('Agora remote subscribe failed', err)
            }
          }
          window.clearTimeout(stuckTimer)
          // Always enter the room after a successful channel join — video may
          // arrive later via user-published, or host may be on BRB with A/V off.
          enterRoom({ paused: initialPaused })
          if (containerHasVideo(videoRef.current)) {
            setHasVideoEl(true)
          }
        }
      } catch (err) {
        console.error('Agora live join failed', err)
        window.clearTimeout(stuckTimer)
        if (mounted && !endedRef.current) {
          if (isHost) markLive()
          else enterRoom({ paused: initialPaused })
        }
      }
    }

    start()

    return () => {
      mounted = false
      if (stuckTimer != null) window.clearTimeout(stuckTimer)
      camRef.current?.close()
      micRef.current?.close()
      clientRef.current?.leave().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- join once per creds
  }, [creds, isHost])

  async function cleanup() {
    camRef.current?.close()
    micRef.current?.close()
    await clientRef.current?.leave().catch(() => {})
  }

  async function handlePause() {
    if (!liveId || brbBusy) return
    setBrbBusy(true)
    try {
      const result = onPause
        ? await onPause({ message: 'Be right back' })
        : await pauseCreatorLive(liveId, { message: 'Be right back' })
      applyBrb({
        isPaused: true,
        brbMessage: result.live.brbMessage,
        brbImageUrl: result.live.brbImageUrl,
      })
      await setLocalTracksEnabled(false)
    } catch (err) {
      console.error('Failed to pause live', err)
    } finally {
      setBrbBusy(false)
    }
  }

  async function handleResume() {
    if (!liveId || brbBusy) return
    setBrbBusy(true)
    try {
      const result = onResume
        ? await onResume()
        : await resumeCreatorLive(liveId)
      applyBrb({
        isPaused: Boolean(result.live.isPaused),
        brbMessage: result.live.brbMessage,
        brbImageUrl: result.live.brbImageUrl,
      })
      await setLocalTracksEnabled(true)
    } catch (err) {
      console.error('Failed to resume live', err)
    } finally {
      setBrbBusy(false)
    }
  }

  // Only show a blocking overlay while the very first join is in flight, or ended.
  // Once status is "live", stay in the room even if video hasn't painted yet.
  const showStatusOverlay =
    !isPaused && (status === 'ended' || status === 'connecting')

  const statusMessage =
    status === 'ended'
      ? 'Live is ended'
      : isHost
        ? 'You are live'
        : 'Connecting to stream…'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative z-30 flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {status === 'ended' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/70">
              Ended
            </span>
          ) : isPaused ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
              BRB
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              Live
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            {subtitle ? (
              <p className="truncate text-[12px] text-white/50">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {status !== 'ended' ? (
          <div className="flex shrink-0 items-center gap-2">
            {isHost && liveId ? (
              isPaused ? (
                <button
                  type="button"
                  disabled={brbBusy}
                  onClick={() => void handleResume()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  <Play className="size-4 fill-black" />
                  Resume
                </button>
              ) : (
                <button
                  type="button"
                  disabled={brbBusy}
                  onClick={() => void handlePause()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3.5 py-2 text-[13px] font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
                >
                  <Coffee className="size-4" />
                  BRB
                </button>
              )
            ) : null}
            <button
              type="button"
              onClick={async () => {
                await cleanup()
                if (isHost && onEnd) onEnd()
                else onLeave()
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/20"
            >
              <X className="size-4" />
              {isHost ? 'End live' : 'Leave'}
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative flex-1">
        <div ref={videoRef} className="absolute inset-0 bg-[#0b0b0f]" />

        {isPaused ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-[#0b0b0f]">
            {brbImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary creator-provided BRB URL
              <img
                src={brbImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.35), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(244,63,94,0.25), transparent 50%), linear-gradient(160deg, #12121a 0%, #1a1410 45%, #0b0b0f 100%)',
                }}
              />
            )}
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
              <span className="flex size-20 items-center justify-center rounded-3xl bg-amber-500/95 shadow-lg shadow-amber-500/20">
                <Coffee className="size-9 text-black" />
              </span>
              <div>
                <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {brbMessage || 'Be right back'}
                </p>
                <p className="mt-2 text-sm text-white/55">
                  Stream is still live — hang tight
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {showStatusOverlay ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500">
              <Radio className="size-7 text-white" />
            </span>
            <p className="text-base font-semibold text-white">{statusMessage}</p>
            {status === 'ended' && !isHost ? (
              <p className="text-[13px] text-white/45">
                Taking you back home…
              </p>
            ) : null}
          </div>
        ) : null}

        {isMockAgora(creds) && status === 'live' && !isPaused && !isHost ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500">
              <Radio className="size-7 text-white" />
            </span>
            <p className="text-base font-semibold text-white">
              You&apos;re in the live
            </p>
            <p className="max-w-xs text-[12px] text-white/35">
              Demo mode — set AGORA_APP_ID / AGORA_APP_CERTIFICATE on the API
              to enable real video.
            </p>
          </div>
        ) : null}

        {liveId && status !== 'ended' ? (
          <LiveChatOverlay
            liveId={liveId}
            emojiPrice={emojiPrice}
            isHost={isHost}
          />
        ) : null}
      </div>
    </div>
  )
}
