'use client'

import { useEffect, useRef, useState } from 'react'
import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import { Radio, X } from 'lucide-react'
import { getLive, isMockAgora, type AgoraCreds } from '@/lib/live'
import { LiveChatOverlay } from '@/components/live/LiveChatOverlay'

interface LiveRoomProps {
  creds: AgoraCreds
  title: string
  subtitle?: string
  /** Used by viewers to poll when the creator ends the session. */
  liveId?: string
  /** Admin-set price per emoji reaction (viewers). */
  emojiPrice?: number | null
  onLeave: () => void
  /** Called after the ended message is shown (viewers → redirect home). */
  onEnded?: () => void
  /** Host-only end action (also ends the session server-side). */
  onEnd?: () => void
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
  onLeave,
  onEnded,
  onEnd,
}: LiveRoomProps) {
  const isHost = creds.role === 'host'
  const [status, setStatus] = useState<
    'connecting' | 'live' | 'waiting' | 'ended'
  >('connecting')
  const [hasVideoEl, setHasVideoEl] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const camRef = useRef<ICameraVideoTrack | null>(null)
  const micRef = useRef<IMicrophoneAudioTrack | null>(null)
  const endedRef = useRef(false)

  function markEnded() {
    if (endedRef.current) return
    endedRef.current = true
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

  // Viewers: poll API so we detect "End live" even if Agora events miss.
  useEffect(() => {
    if (isHost || !liveId) return
    let cancelled = false

    const tick = async () => {
      try {
        const details = await getLive(liveId)
        if (!cancelled && details.live.status === 'ENDED') {
          markEnded()
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
    const mock = isMockAgora(creds)

    async function start() {
      if (mock) {
        setStatus(isHost ? 'live' : 'waiting')
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

        // Never flip back to "waiting" after video has shown — that overlay
        // was covering a working stream for viewers.
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
          if (mounted && !endedRef.current) {
            if (containerHasVideo(videoRef.current)) markLive()
            else setStatus((prev) => (prev === 'live' || prev === 'ended' ? prev : 'waiting'))
          }
        }
      } catch (err) {
        console.error('Agora live join failed', err)
        if (mounted && !endedRef.current) {
          if (containerHasVideo(videoRef.current)) markLive()
          else setStatus(isHost ? 'live' : 'waiting')
        }
      }
    }

    start()

    return () => {
      mounted = false
      camRef.current?.close()
      micRef.current?.close()
      clientRef.current?.leave().catch(() => {})
    }
  }, [creds, isHost])

  async function cleanup() {
    camRef.current?.close()
    micRef.current?.close()
    await clientRef.current?.leave().catch(() => {})
  }

  // Show the waiting/connecting overlay only when there is no video yet.
  const showStatusOverlay =
    status === 'ended' ||
    (status !== 'live' && !hasVideoEl)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative z-30 flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {status === 'ended' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/70">
              Ended
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
        ) : null}
      </div>

      <div className="relative flex-1">
        <div ref={videoRef} className="absolute inset-0 bg-[#0b0b0f]" />

        {showStatusOverlay ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500">
              <Radio className="size-7 text-white" />
            </span>
            <p className="text-base font-semibold text-white">
              {status === 'ended'
                ? 'Live is ended'
                : status === 'connecting'
                  ? 'Connecting…'
                  : isHost
                    ? 'You are live'
                    : 'Waiting for the creator to start streaming…'}
            </p>
            {status === 'ended' && !isHost ? (
              <p className="text-[13px] text-white/45">
                Taking you back home…
              </p>
            ) : null}
            {isMockAgora(creds) && status !== 'ended' ? (
              <p className="max-w-xs text-[12px] text-white/35">
                Demo mode — set AGORA_APP_ID / AGORA_APP_CERTIFICATE on the API
                to enable real video.
              </p>
            ) : null}
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
