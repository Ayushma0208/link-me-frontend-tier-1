'use client'

import { useEffect, useRef, useState } from 'react'
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'
import {
  Clapperboard,
  Coffee,
  Copy,
  Headphones,
  Link2,
  Loader2,
  Play,
  Radio,
  SwitchCamera,
  X,
} from 'lucide-react'
import {
  DEFAULT_STREAM_QUALITY,
  buildLiveInviteUrl,
  disableLiveInvite,
  enableLiveInvite,
  getLive,
  isMockAgora,
  leaveLive,
  pauseCreatorLive,
  resumeCreatorLive,
  setLatencyModeMine,
  type AgoraCreds,
  type LiveDto,
  type LiveLatencyMode,
  type PauseLiveInput,
  type StreamQualityPolicy,
  type StreamQualityTier,
} from '@/lib/live'
import { detectDeviceClass, type DeviceClass } from '@/lib/device-class'
import { flipCameraTrack } from '@/lib/agora-camera'
import {
  connectLiveSocket,
  type LiveBrbPayload,
  type LiveLatencyPayload,
} from '@/lib/live-socket'
import { LiveChatOverlay } from '@/components/live/LiveChatOverlay'
import { FloatingReactions } from '@/components/live/FloatingReactions'
import { LivePollOverlay } from '@/components/live/LivePollOverlay'
import {
  StreamHealthDashboard,
  stabilityFrom,
  type StreamHealthMetrics,
} from '@/components/live/StreamHealthDashboard'

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
  /** Session Agora audience latency (default ultra-low). */
  initialLatencyMode?: LiveLatencyMode
  /** Dual-stream profiles + recommended remote tier (from join/host grant). */
  streamQuality?: StreamQualityPolicy
  onLeave: () => void
  /** Called after the ended message is shown (viewers → redirect home). */
  onEnded?: () => void
  /** Host-only end action (also ends the session server-side). */
  onEnd?: () => void
  /** Override pause API (e.g. admin host). Defaults to creator self-service. */
  onPause?: (input: PauseLiveInput) => Promise<{ live: LiveDto }>
  /** Override resume API (e.g. admin host). Defaults to creator self-service. */
  onResume?: () => Promise<{ live: LiveDto }>
  /** Override latency API (e.g. admin host). */
  onSetLatency?: (mode: LiveLatencyMode) => Promise<{ live: LiveDto }>
  /** Private warm-up — host only until go-public. */
  isPractice?: boolean
  /** Seed invite-only flag when host re-enters. */
  initialInviteEnabled?: boolean
  initialInvitePrice?: number | null
  /** Override invite APIs (e.g. admin host). */
  onEnableInvite?: (invitePrice?: number | null) => Promise<{
    live: LiveDto
    inviteToken: string
  }>
  onDisableInvite?: () => Promise<{ live: LiveDto }>
  /** Host flips practice → public LIVE (same Agora channel). */
  onGoPublic?: () => Promise<{ live: LiveDto }>
  /** Viewer per-minute billing seed from join grant. */
  initialBilling?: {
    mode: 'PER_MINUTE'
    pricePerMinute: number
    heldMinutes: number
    currency: string
  } | null
}

/** Agora audience level: 2 = ultra-low, 1 = low (normal/stable). */
function agoraAudienceLevel(mode: LiveLatencyMode): 1 | 2 {
  return mode === 'NORMAL' ? 1 : 2
}

/** Agora RemoteStreamType: 0 = high, 1 = low. */
function agoraRemoteStreamType(tier: StreamQualityTier): 0 | 1 {
  return tier === 'LOW' ? 1 : 0
}

function resolveInitialTier(
  policy: StreamQualityPolicy,
  deviceClass: DeviceClass
): StreamQualityTier {
  if (deviceClass === 'BUDGET') return 'LOW'
  return policy.recommended === 'LOW' ? 'LOW' : 'HIGH'
}

/** Label for the Auto quality badge from dual-stream tier + profile height. */
function autoQualityLabel(
  tier: StreamQualityTier,
  policy: StreamQualityPolicy
): string {
  const height =
    tier === 'LOW' ? policy.low.height : policy.high.height
  return `Auto · ${height}p`
}

function containerHasVideo(el: HTMLElement | null): boolean {
  if (!el) return false
  const vid = el.querySelector('video')
  if (!vid) return false
  // Agora may inject the element before frames arrive — still treat as live UI.
  return true
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function teardownClient(client: IAgoraRTCClient | null) {
  if (!client) return
  try {
    client.removeAllListeners()
  } catch {
    // ignore
  }
  try {
    await client.leave()
  } catch {
    // ignore — already left / mid-leave on rejoin
  }
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
  initialLatencyMode = 'ULTRA_LOW',
  streamQuality: streamQualityProp,
  onLeave,
  onEnded,
  onEnd,
  onPause,
  onResume,
  onSetLatency,
  isPractice: isPracticeProp = false,
  initialInviteEnabled = false,
  initialInvitePrice = null,
  onEnableInvite,
  onDisableInvite,
  onGoPublic,
  initialBilling = null,
}: LiveRoomProps) {
  const isHost = creds.role === 'host'
  const streamQuality = streamQualityProp ?? DEFAULT_STREAM_QUALITY
  const deviceClassRef = useRef<DeviceClass>(
    typeof navigator !== 'undefined' ? detectDeviceClass() : 'UNKNOWN'
  )
  const initialStreamTier = resolveInitialTier(
    streamQuality,
    deviceClassRef.current
  )
  const streamTierRef = useRef<StreamQualityTier>(initialStreamTier)
  const poorDownlinkStreakRef = useRef(0)
  const goodDownlinkStreakRef = useRef(0)
  const [status, setStatus] = useState<
    'connecting' | 'live' | 'waiting' | 'ended'
  >('connecting')
  const [hasVideoEl, setHasVideoEl] = useState(false)
  const [waitingForHostVideo, setWaitingForHostVideo] = useState(false)
  const [isPaused, setIsPaused] = useState(initialPaused)
  const [isPractice, setIsPractice] = useState(isPracticeProp)
  const [latencyMode, setLatencyMode] =
    useState<LiveLatencyMode>(initialLatencyMode)
  const [brbMessage, setBrbMessage] = useState(
    initialBrbMessage ?? 'Be right back'
  )
  const [brbImageUrl, setBrbImageUrl] = useState<string | null>(
    initialBrbImageUrl
  )
  const [billingInfo, setBillingInfo] = useState<{
    pricePerMinute: number
    billedMinutes: number
    heldMinutes: number
    totalAmount: string
    paused?: boolean
  } | null>(
    initialBilling
      ? {
          pricePerMinute: initialBilling.pricePerMinute,
          billedMinutes: 0,
          heldMinutes: initialBilling.heldMinutes,
          totalAmount: '0.00',
        }
      : null
  )
  const [billingLow, setBillingLow] = useState(false)
  const [brbBusy, setBrbBusy] = useState(false)
  const [goPublicBusy, setGoPublicBusy] = useState(false)
  const [latencyBusy, setLatencyBusy] = useState(false)
  const [flipBusy, setFlipBusy] = useState(false)
  const [inviteEnabled, setInviteEnabled] = useState(initialInviteEnabled)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [invitePrice, setInvitePrice] = useState<number | null>(
    initialInvitePrice != null ? Number(initialInvitePrice) : null
  )
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)
  /** Viewer remote dual-stream tier (HIGH/LOW) for Auto quality badge. */
  const [viewerStreamTier, setViewerStreamTier] =
    useState<StreamQualityTier>(initialStreamTier)
  /** Viewer-only: tab/app minimized — remote video off, audio still playing. */
  const [audioOnlyMode, setAudioOnlyMode] = useState(false)
  /** Host-only: real-time Agora send stats for the health dashboard. */
  const [healthMetrics, setHealthMetrics] = useState<StreamHealthMetrics | null>(
    null
  )
  const [healthExpanded, setHealthExpanded] = useState(false)
  const [pollToolbarEl, setPollToolbarEl] = useState<HTMLDivElement | null>(
    null
  )
  const videoRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const camRef = useRef<ICameraVideoTrack | null>(null)
  const micRef = useRef<IMicrophoneAudioTrack | null>(null)
  const endedRef = useRef(false)
  const leavingRef = useRef(false)
  const backgroundAudioRef = useRef(false)
  const uplinkQualityRef = useRef<number | null>(null)
  const isPausedRef = useRef(isPaused)
  isPausedRef.current = isPaused
  const latencyModeRef = useRef(latencyMode)
  latencyModeRef.current = latencyMode

  useEffect(() => {
    setIsPractice(isPracticeProp)
  }, [isPracticeProp])

  useEffect(() => {
    setInviteEnabled(initialInviteEnabled)
  }, [initialInviteEnabled])

  useEffect(() => {
    setInvitePrice(
      initialInvitePrice != null ? Number(initialInvitePrice) : null
    )
  }, [initialInvitePrice])

  useEffect(() => {
    setLatencyMode(initialLatencyMode)
  }, [initialLatencyMode])

  async function applyAudienceLatency(mode: LiveLatencyMode) {
    const client = clientRef.current
    if (!client || isHost || leavingRef.current) return
    try {
      await client.setClientRole('audience', {
        level: agoraAudienceLevel(mode),
      })
    } catch (err) {
      console.error('Failed to apply audience latency', err)
    }
  }

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
    backgroundAudioRef.current = false
    setAudioOnlyMode(false)
    setHealthMetrics(null)
    setHealthExpanded(false)
    uplinkQualityRef.current = null
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

  // Audience: after ~6s with no remote video, explain the black screen.
  useEffect(() => {
    if (isHost || isPaused || status !== 'live' || hasVideoEl || audioOnlyMode) {
      setWaitingForHostVideo(false)
      return
    }
    const t = window.setTimeout(() => {
      if (endedRef.current || isPausedRef.current) return
      setWaitingForHostVideo(true)
    }, 6000)
    return () => window.clearTimeout(t)
  }, [isHost, isPaused, status, hasVideoEl, audioOnlyMode])

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
          const nextMode =
            details.live.latencyMode === 'NORMAL' ? 'NORMAL' : 'ULTRA_LOW'
          if (nextMode !== latencyModeRef.current) {
            setLatencyMode(nextMode)
            void applyAudienceLatency(nextMode)
          }
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

    const onLatency = (payload: LiveLatencyPayload) => {
      if (payload.liveId !== liveId) return
      const nextMode =
        payload.latencyMode === 'NORMAL' ? 'NORMAL' : 'ULTRA_LOW'
      setLatencyMode(nextMode)
      if (!isHost) void applyAudienceLatency(nextMode)
    }

    const onBillingTick = (payload: {
      liveId?: string
      billedMinutes?: number
      heldMinutes?: number
      pricePerMinute?: number
      totalAmount?: string
      paused?: boolean
    }) => {
      if (payload.liveId !== liveId || isHost) return
      setBillingInfo({
        pricePerMinute: Number(payload.pricePerMinute ?? 0),
        billedMinutes: Number(payload.billedMinutes ?? 0),
        heldMinutes: Number(payload.heldMinutes ?? 0),
        totalAmount: String(payload.totalAmount ?? '0.00'),
        paused: Boolean(payload.paused),
      })
      setBillingLow(false)
    }

    const onBillingLow = (payload: { liveId?: string }) => {
      if (payload.liveId !== liveId || isHost) return
      setBillingLow(true)
    }

    const onBillingExhausted = (payload: { liveId?: string; reason?: string }) => {
      if (payload.liveId !== liveId || isHost) return
      void cleanup().then(() => {
        ;(onEnded ?? onLeave)()
      })
    }

    socket.emit('live:join', { liveId })
    socket.on('live:brb', onBrb)
    socket.on('live:latency', onLatency)
    socket.on('live:billing-tick', onBillingTick)
    socket.on('live:billing-low', onBillingLow)
    socket.on('live:billing-exhausted', onBillingExhausted)

    return () => {
      socket.off('live:brb', onBrb)
      socket.off('live:latency', onLatency)
      socket.off('live:billing-tick', onBillingTick)
      socket.off('live:billing-low', onBillingLow)
      socket.off('live:billing-exhausted', onBillingExhausted)
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

  // Join once per channel + uid. Do not depend on the whole creds object —
  // go-public returns a refreshed token object and must not tear down the host
  // camera mid-session.
  const agoraJoinKey = `${creds.appId}:${creds.channel}:${String(creds.uid)}:${creds.role}`

  useEffect(() => {
    let mounted = true
    let stuckTimer: number | undefined
    let detachBackgroundAudio: (() => void) | undefined
    const mock = isMockAgora(creds)
    leavingRef.current = false

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

    function playRemoteVideo(user: IAgoraRTCRemoteUser) {
      if (backgroundAudioRef.current) return
      const track = user.videoTrack
      const el = videoRef.current
      if (!track || !el) return
      // Avoid stacking stale <video> nodes after leave/rejoin.
      el.replaceChildren()
      track.play(el)
      if (mounted) markLive()
    }

    async function applyRemoteStreamTier(
      client: IAgoraRTCClient,
      uid: IAgoraRTCRemoteUser['uid'],
      tier: StreamQualityTier
    ) {
      try {
        await client.setRemoteVideoStreamType(uid, agoraRemoteStreamType(tier))
        // Fallback to low stream when the network worsens (Agora safety net).
        await client.setStreamFallbackOption(uid, 1)
        streamTierRef.current = tier
        if (mounted) setViewerStreamTier(tier)
      } catch (err) {
        console.warn('Failed to set remote stream type', err)
      }
    }

    async function subscribeRemote(
      client: IAgoraRTCClient,
      user: IAgoraRTCRemoteUser,
      mediaType: 'audio' | 'video'
    ) {
      // Viewers in background audio mode skip video to save bandwidth.
      if (mediaType === 'video' && backgroundAudioRef.current) return
      try {
        await client.subscribe(user, mediaType)
        if (mediaType === 'video') {
          if (backgroundAudioRef.current) {
            try {
              await client.unsubscribe(user, 'video')
            } catch {
              // ignore
            }
            return
          }
          await applyRemoteStreamTier(
            client,
            user.uid,
            streamTierRef.current
          )
          playRemoteVideo(user)
        }
        if (mediaType === 'audio') user.audioTrack?.play()
      } catch (err) {
        console.error('Agora subscribe failed', err)
      }
    }

    function setMediaSessionPlaying(playing: boolean) {
      if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
        return
      }
      try {
        if (playing) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Live',
            artist: subtitle?.trim() || 'LinkMe Live',
            album: 'LinkMe',
          })
          navigator.mediaSession.playbackState = 'playing'
        } else {
          navigator.mediaSession.playbackState = 'none'
          navigator.mediaSession.metadata = null
        }
      } catch {
        // Media Session is best-effort (browser support varies).
      }
    }

    /** Stop remote video while keeping audio — used when the tab/app is hidden. */
    async function enterBackgroundAudio(client: IAgoraRTCClient) {
      if (isHost || mock || !mounted || leavingRef.current || endedRef.current) {
        return
      }
      backgroundAudioRef.current = true
      if (mounted) setAudioOnlyMode(true)
      setMediaSessionPlaying(true)

      for (const user of client.remoteUsers) {
        if (!user.videoTrack && !user.hasVideo) continue
        try {
          user.videoTrack?.stop()
          await client.unsubscribe(user, 'video')
        } catch (err) {
          console.warn('Failed to drop remote video for background audio', err)
        }
      }
      if (videoRef.current) videoRef.current.replaceChildren()

      // Re-assert audio playback — some browsers pause media on hide.
      for (const user of client.remoteUsers) {
        try {
          user.audioTrack?.play()
        } catch {
          // ignore
        }
      }
    }

    async function exitBackgroundAudio(client: IAgoraRTCClient) {
      if (isHost || !mounted || leavingRef.current) return
      backgroundAudioRef.current = false
      if (mounted) setAudioOnlyMode(false)
      setMediaSessionPlaying(false)

      for (const user of client.remoteUsers) {
        if (!mounted || leavingRef.current) return
        if (user.hasVideo && !user.videoTrack) {
          await subscribeRemote(client, user, 'video')
        } else if (user.videoTrack) {
          await applyRemoteStreamTier(
            client,
            user.uid,
            streamTierRef.current
          )
          playRemoteVideo(user)
        }
        if (user.audioTrack) {
          try {
            user.audioTrack.play()
          } catch {
            // ignore
          }
        }
      }
    }

    function attachBackgroundAudioMode(client: IAgoraRTCClient) {
      if (isHost || mock) return

      const onVisibility = () => {
        if (!mounted || leavingRef.current || endedRef.current) return
        if (document.visibilityState === 'hidden') {
          void enterBackgroundAudio(client)
        } else {
          void exitBackgroundAudio(client)
        }
      }

      // Already backgrounded at join (e.g. opened in a background tab).
      if (document.visibilityState === 'hidden') {
        void enterBackgroundAudio(client)
      }

      document.addEventListener('visibilitychange', onVisibility)
      return () => {
        document.removeEventListener('visibilitychange', onVisibility)
        backgroundAudioRef.current = false
        setMediaSessionPlaying(false)
        if (mounted) setAudioOnlyMode(false)
      }
    }

    function attachNetworkQualityAdaptation(client: IAgoraRTCClient) {
      if (isHost) return
      client.on('network-quality', (stats) => {
        if (!mounted || leavingRef.current) return
        const downlink = stats.downlinkNetworkQuality
        // 0 = unknown — ignore
        if (!downlink) return

        const budgetLocked = deviceClassRef.current === 'BUDGET'
        const current = streamTierRef.current

        // Very poor (≥5): downshift immediately on next check.
        if (downlink >= 5) {
          poorDownlinkStreakRef.current += 1
          goodDownlinkStreakRef.current = 0
        } else if (downlink >= 4) {
          poorDownlinkStreakRef.current += 1
          goodDownlinkStreakRef.current = 0
        } else if (downlink <= 2) {
          goodDownlinkStreakRef.current += 1
          poorDownlinkStreakRef.current = 0
        } else {
          poorDownlinkStreakRef.current = 0
          goodDownlinkStreakRef.current = 0
          return
        }

        const poorNeeded = downlink >= 5 ? 1 : 2
        const nextTier: StreamQualityTier | null =
          poorDownlinkStreakRef.current >= poorNeeded && current === 'HIGH'
            ? 'LOW'
            : !budgetLocked &&
                goodDownlinkStreakRef.current >= 3 &&
                current === 'LOW'
              ? 'HIGH'
              : null

        if (!nextTier) return

        poorDownlinkStreakRef.current = 0
        goodDownlinkStreakRef.current = 0
        streamTierRef.current = nextTier
        if (mounted) setViewerStreamTier(nextTier)
        for (const user of client.remoteUsers) {
          if (!user.hasVideo && !user.videoTrack) continue
          void applyRemoteStreamTier(client, user.uid, nextTier)
        }
      })
    }

    /** Host: track uplink for the stream health dashboard. */
    function attachHostUplinkMonitoring(client: IAgoraRTCClient) {
      if (!isHost) return
      client.on('network-quality', (stats) => {
        if (!mounted || leavingRef.current) return
        uplinkQualityRef.current = stats.uplinkNetworkQuality
      })
    }

    /** Host may already be publishing — remotes can appear slightly after join. */
    async function subscribeExistingRemotes(client: IAgoraRTCClient) {
      for (const user of client.remoteUsers) {
        if (!mounted) return
        if (user.hasVideo && !user.videoTrack) {
          await subscribeRemote(client, user, 'video')
        } else if (user.videoTrack) {
          await applyRemoteStreamTier(
            client,
            user.uid,
            streamTierRef.current
          )
          playRemoteVideo(user)
        }
        if (user.hasAudio && !user.audioTrack) {
          await subscribeRemote(client, user, 'audio')
        } else if (user.audioTrack) {
          user.audioTrack.play()
        }
      }
    }

    async function joinChannel(client: IAgoraRTCClient) {
      const uid =
        typeof creds.uid === 'number' ? creds.uid : Number(creds.uid) || null
      let lastError: unknown
      // Same stable UID: rapid leave→rejoin can fail until Agora releases the seat.
      for (let attempt = 0; attempt < 4; attempt++) {
        if (!mounted) return
        try {
          await client.join(creds.appId, creds.channel, creds.token, uid)
          return
        } catch (err) {
          lastError = err
          console.warn('Agora join attempt failed', { attempt, err })
          try {
            await client.leave()
          } catch {
            // ignore
          }
          await delay(350 * (attempt + 1))
        }
      }
      throw lastError
    }

    async function start() {
      // Safety: if Agora hangs, still enter the room so leave/rejoin never sticks.
      stuckTimer = window.setTimeout(() => {
        enterRoom()
      }, 4000)

      // Demo / missing Agora: join API already proved the session is live.
      if (mock) {
        window.clearTimeout(stuckTimer)
        setHasVideoEl(true)
        enterRoom()
        return
      }

      try {
        const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
        if (!mounted) {
          await teardownClient(client)
          return
        }
        clientRef.current = client

        if (isHost) {
          await client.setClientRole('host')
        } else {
          await client.setClientRole('audience', {
            level: agoraAudienceLevel(latencyModeRef.current),
          })
        }

        client.on('user-published', async (user, mediaType) => {
          if (!mounted || leavingRef.current) return
          if (mediaType !== 'audio' && mediaType !== 'video') return
          await subscribeRemote(client, user, mediaType)
        })

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video' && videoRef.current) {
            // Track stopped — clear so a later publish can play cleanly.
            if (!user.hasVideo) videoRef.current.replaceChildren()
          }
        })

        attachNetworkQualityAdaptation(client)
        attachHostUplinkMonitoring(client)
        detachBackgroundAudio = attachBackgroundAudioMode(client)

        await joinChannel(client)
        if (!mounted) return

        if (isHost) {
          // Dual-stream so each viewer can pick HIGH vs LOW bitrate.
          try {
            client.setLowStreamParameter({
              width: streamQuality.low.width,
              height: streamQuality.low.height,
              framerate: streamQuality.low.frameRate,
              bitrate: streamQuality.low.bitrate,
            })
            await client.enableDualStream()
          } catch (err) {
            console.warn('Failed to enable Agora dual-stream', err)
          }

          const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks(
            undefined,
            {
              encoderConfig: {
                width: streamQuality.high.width,
                height: streamQuality.high.height,
                frameRate: streamQuality.high.frameRate,
                bitrateMax: streamQuality.high.bitrate,
              },
            }
          )
          if (!mounted) {
            mic.close()
            cam.close()
            return
          }
          micRef.current = mic
          camRef.current = cam
          if (videoRef.current) {
            videoRef.current.replaceChildren()
            cam.play(videoRef.current)
          }
          await client.publish([mic, cam])
          if (initialPaused) {
            await setLocalTracksEnabled(false)
          }
          window.clearTimeout(stuckTimer)
          if (mounted) markLive()
        } else {
          await subscribeExistingRemotes(client)
          // Remotes / tracks often arrive a beat after join on rejoin.
          // Skip the wait when already in background audio (no video expected).
          for (
            let i = 0;
            i < 10 && mounted && !backgroundAudioRef.current;
            i++
          ) {
            if (containerHasVideo(videoRef.current)) break
            await delay(300)
            await subscribeExistingRemotes(client)
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
          // Keep connecting UI for viewers so we don't fake a blank "LIVE".
          if (isHost) markLive()
          else setStatus('connecting')
        }
      }
    }

    void start()

    return () => {
      mounted = false
      leavingRef.current = true
      detachBackgroundAudio?.()
      backgroundAudioRef.current = false
      setAudioOnlyMode(false)
      setHealthMetrics(null)
      uplinkQualityRef.current = null
      if (stuckTimer != null) window.clearTimeout(stuckTimer)
      const client = clientRef.current
      clientRef.current = null
      const cam = camRef.current
      const mic = micRef.current
      camRef.current = null
      micRef.current = null
      cam?.close()
      mic?.close()
      void teardownClient(client)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- join once per channel/uid
  }, [agoraJoinKey, isHost])

  // Host: poll Agora local send stats for the stream health dashboard.
  useEffect(() => {
    if (!isHost || status === 'ended') {
      if (status === 'ended') setHealthMetrics(null)
      return
    }

    if (isMockAgora(creds) || status === 'connecting') {
      setHealthMetrics({
        sendBitrateBps: null,
        sendFps: null,
        sendWidth: null,
        sendHeight: null,
        packetLossPercent: null,
        rttMs: null,
        uplinkQuality: null,
        stability: isPausedRef.current ? 'paused' : 'unknown',
        paused: isPausedRef.current,
      })
      return
    }

    const normalizeLossPercent = (raw: number | undefined): number | null => {
      if (raw == null || !Number.isFinite(raw) || raw < 0) return null
      // Agora may report 0–1 fraction or already-as-percent.
      return raw <= 1 ? raw * 100 : raw
    }

    const tick = () => {
      const client = clientRef.current
      if (!client || leavingRef.current || endedRef.current) return
      const paused = isPausedRef.current
      try {
        const video = client.getLocalVideoStats()
        const rtc = client.getRTCStats()
        const uplink = uplinkQualityRef.current
        const packetLossPercent = paused
          ? null
          : normalizeLossPercent(video?.currentPacketLossRate)
        const rttMs = paused
          ? null
          : typeof rtc?.RTT === 'number' && Number.isFinite(rtc.RTT)
            ? rtc.RTT
            : typeof video?.sendRttMs === 'number' &&
                Number.isFinite(video.sendRttMs)
              ? video.sendRttMs
              : null

        setHealthMetrics({
          sendBitrateBps: paused ? null : (video?.sendBitrate ?? null),
          sendFps: paused
            ? null
            : (video?.sendFrameRate ?? video?.captureFrameRate ?? null),
          sendWidth: paused ? null : (video?.sendResolutionWidth ?? null),
          sendHeight: paused ? null : (video?.sendResolutionHeight ?? null),
          packetLossPercent,
          rttMs,
          uplinkQuality: uplink,
          stability: stabilityFrom({
            uplinkQuality: uplink,
            packetLossPercent: packetLossPercent ?? 0,
            rttMs: rttMs ?? 0,
            paused,
          }),
          paused,
        })
      } catch (err) {
        console.warn('Stream health poll failed', err)
      }
    }

    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [agoraJoinKey, creds, isHost, status])

  async function cleanup() {
    leavingRef.current = true
    backgroundAudioRef.current = false
    setAudioOnlyMode(false)
    setHealthMetrics(null)
    setHealthExpanded(false)
    uplinkQualityRef.current = null
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none'
        navigator.mediaSession.metadata = null
      } catch {
        // ignore
      }
    }
    const client = clientRef.current
    clientRef.current = null
    camRef.current?.close()
    micRef.current?.close()
    camRef.current = null
    micRef.current = null
    await teardownClient(client)
    if (!isHost && liveId) {
      try {
        await leaveLive(liveId)
      } catch {
        // ignore — billing may already have stopped
      }
    }
    // Give Agora a beat to release the stable UID before a quick rejoin.
    await delay(400)
  }

  async function handleFlipCamera() {
    if (!isHost || isPaused || flipBusy || leavingRef.current) return
    const cam = camRef.current
    if (!cam) return
    setFlipBusy(true)
    try {
      const result = await flipCameraTrack(cam)
      if (!result.ok) {
        console.warn('Flip camera:', result.message)
        return
      }
      // Re-attach local preview if Agora cleared the container.
      if (videoRef.current) {
        videoRef.current.replaceChildren()
        cam.play(videoRef.current)
      }
    } catch (err) {
      console.error('Failed to flip camera', err)
    } finally {
      setFlipBusy(false)
    }
  }

  async function handleEnableInvite() {
    if (!isHost || !liveId || inviteBusy) return
    const raw = window.prompt(
      'Private invite price (₹)?\n• Leave empty = use this live’s FREE/PAID price\n• 0 = free for invitees\n• e.g. 199 = charge ₹199 via invite link',
      invitePrice != null ? String(invitePrice) : ''
    )
    if (raw === null) return
    let priceArg: number | null | undefined = undefined
    const trimmed = raw.trim()
    if (trimmed !== '') {
      const n = Number(trimmed)
      if (!Number.isFinite(n) || n < 0) {
        window.alert('Enter a valid price (0 or more), or leave empty.')
        return
      }
      priceArg = n
    }
    setInviteBusy(true)
    setInviteCopied(false)
    try {
      const result = onEnableInvite
        ? await onEnableInvite(priceArg)
        : await enableLiveInvite(liveId, priceArg)
      setInviteEnabled(Boolean(result.live.inviteEnabled))
      setInvitePrice(
        result.live.invitePrice != null ? Number(result.live.invitePrice) : null
      )
      setInviteToken(result.inviteToken)
      const url = buildLiveInviteUrl(liveId, result.inviteToken)
      try {
        await navigator.clipboard.writeText(url)
        setInviteCopied(true)
      } catch {
        // clipboard may be blocked
      }
    } catch (err) {
      console.error('Failed to enable invite', err)
    } finally {
      setInviteBusy(false)
    }
  }

  async function handleCopyInvite() {
    if (!liveId || !inviteToken) {
      await handleEnableInvite()
      return
    }
    const url = buildLiveInviteUrl(liveId, inviteToken)
    try {
      await navigator.clipboard.writeText(url)
      setInviteCopied(true)
    } catch (err) {
      console.error('Failed to copy invite', err)
    }
  }

  async function handleDisableInvite() {
    if (!isHost || !liveId || inviteBusy) return
    setInviteBusy(true)
    try {
      const result = onDisableInvite
        ? await onDisableInvite()
        : await disableLiveInvite(liveId)
      setInviteEnabled(Boolean(result.live.inviteEnabled))
      setInvitePrice(null)
      setInviteToken(null)
      setInviteCopied(false)
    } catch (err) {
      console.error('Failed to disable invite', err)
    } finally {
      setInviteBusy(false)
    }
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

  async function handleGoPublic() {
    if (!onGoPublic || goPublicBusy) return
    setGoPublicBusy(true)
    try {
      const result = await onGoPublic()
      setIsPractice(
        Boolean(result.live.isPractice) || result.live.status === 'PRACTICE'
      )
      if (result.live.latencyMode) {
        setLatencyMode(
          result.live.latencyMode === 'NORMAL' ? 'NORMAL' : 'ULTRA_LOW'
        )
      }
    } finally {
      setGoPublicBusy(false)
    }
  }

  async function handleSetLatency(mode: LiveLatencyMode) {
    if (!liveId || latencyBusy || mode === latencyMode) return
    setLatencyBusy(true)
    try {
      const result = onSetLatency
        ? await onSetLatency(mode)
        : await setLatencyModeMine(liveId, mode)
      const next =
        result.live.latencyMode === 'NORMAL' ? 'NORMAL' : 'ULTRA_LOW'
      setLatencyMode(next)
    } catch (err) {
      console.error('Failed to set latency mode', err)
    } finally {
      setLatencyBusy(false)
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
        ? isPractice
          ? 'Practice mode'
          : 'You are live'
        : 'Connecting to stream…'

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="relative z-30 flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {status === 'ended' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/70">
              Ended
            </span>
          ) : isPractice ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
              <Clapperboard className="size-3" />
              Practice
            </span>
          ) : isPaused ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
              BRB
            </span>
          ) : audioOnlyMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
              <Headphones className="size-3" />
              Audio
            </span>
          ) : status === 'connecting' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/70">
              Connecting
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <span className="size-1.5 animate-pulse rounded-full bg-white" />
              Live
            </span>
          )}
          {isHost && status !== 'ended' ? (
            <StreamHealthDashboard
              metrics={healthMetrics}
              expanded={healthExpanded}
              onToggle={() => setHealthExpanded((open) => !open)}
            />
          ) : null}
          {!isHost &&
          status !== 'ended' &&
          status !== 'connecting' &&
          !isMockAgora(creds) ? (
            <span
              className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80"
              title="Adaptive bitrate — switches with your connection"
            >
              {autoQualityLabel(viewerStreamTier, streamQuality)}
            </span>
          ) : null}
          {!isHost && billingInfo && status !== 'ended' ? (
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                billingLow
                  ? 'border border-amber-400/40 bg-amber-500/20 text-amber-100'
                  : 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-100'
              }`}
              title="Wallet per-minute billing"
            >
              ₹{billingInfo.pricePerMinute}/min
              {billingInfo.billedMinutes > 0
                ? ` · ${billingInfo.billedMinutes}m · ₹${billingInfo.totalAmount}`
                : ''}
              {billingInfo.paused ? ' · paused' : ''}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            {subtitle ? (
              <p className="truncate text-[12px] text-white/50">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {status !== 'ended' ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {isHost && liveId ? (
              <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-0.5">
                <button
                  type="button"
                  disabled={latencyBusy}
                  onClick={() => void handleSetLatency('ULTRA_LOW')}
                  className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-50 ${
                    latencyMode === 'ULTRA_LOW'
                      ? 'bg-white text-black'
                      : 'text-white/55 hover:text-white'
                  }`}
                >
                  Ultra-low
                </button>
                <button
                  type="button"
                  disabled={latencyBusy}
                  onClick={() => void handleSetLatency('NORMAL')}
                  className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition disabled:opacity-50 ${
                    latencyMode === 'NORMAL'
                      ? 'bg-white text-black'
                      : 'text-white/55 hover:text-white'
                  }`}
                >
                  Normal
                </button>
              </div>
            ) : null}
            {isHost && liveId && !isPractice ? (
              <div ref={setPollToolbarEl} className="relative" />
            ) : null}
            {isHost && isPractice && onGoPublic ? (
              <button
                type="button"
                disabled={goPublicBusy}
                onClick={() => void handleGoPublic()}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              >
                <Radio className="size-4" />
                {goPublicBusy ? 'Going live…' : 'Go live to audience'}
              </button>
            ) : null}
            {isHost && liveId ? (
              inviteEnabled ? (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={inviteBusy}
                      onClick={() => void handleCopyInvite()}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3.5 py-2 text-[13px] font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                      title="Copy private invite link"
                    >
                      <Copy className="size-4" />
                      {inviteCopied
                        ? 'Copied!'
                        : inviteToken
                          ? invitePrice != null
                            ? `Copy · ₹${invitePrice}`
                            : 'Copy invite'
                          : 'Rotate & copy'}
                    </button>
                    <button
                      type="button"
                      disabled={inviteBusy}
                      onClick={() => void handleDisableInvite()}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                      title="Disable private invite"
                    >
                      Public
                    </button>
                  </div>
                  <p className="max-w-[15rem] text-right text-[10px] leading-snug text-white/45">
                    Share with fans; stay in this studio to keep video on.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={inviteBusy}
                  onClick={() => void handleEnableInvite()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                  title="Make invite-only and copy link"
                >
                  <Link2 className="size-4" />
                  {inviteBusy ? '…' : 'Private invite'}
                </button>
              )
            ) : null}
            {isHost && !isPaused ? (
              <button
                type="button"
                disabled={flipBusy}
                onClick={() => void handleFlipCamera()}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                title="Flip camera"
              >
                <SwitchCamera className="size-4" />
                {flipBusy ? 'Flipping…' : 'Flip'}
              </button>
            ) : null}
            {isHost && liveId && !isPractice ? (
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
              {isHost ? (isPractice ? 'End practice' : 'End live') : 'Leave'}
            </button>
          </div>
        ) : null}
      </div>

      {isHost && liveId && status !== 'ended' ? (
        <p className="relative z-30 px-4 pb-1 text-[11px] text-white/40">
          Ultra-low syncs chat better; Normal is steadier on weak networks.
        </p>
      ) : null}

      {isPractice && status !== 'ended' ? (
        <div className="relative z-30 mx-4 mb-2 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-3.5 py-2.5 text-[13px] text-amber-50/90">
          Only you can see this — test camera, lighting, and audio
        </div>
      ) : null}

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

        {audioOnlyMode && !isPaused && status !== 'ended' && status !== 'connecting' ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0b0b0f] px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-sky-500/90">
              <Headphones className="size-7 text-black" />
            </span>
            <p className="text-base font-semibold text-white">
              Listening in background
            </p>
            <p className="max-w-xs text-[13px] text-white/45">
              Video paused to save data — audio keeps playing. Return to this
              tab for video.
            </p>
          </div>
        ) : null}

        {waitingForHostVideo &&
        !isHost &&
        !isPaused &&
        !audioOnlyMode &&
        status === 'live' ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white/10">
              <Loader2 className="size-7 animate-spin text-white/80" />
            </span>
            <p className="text-base font-semibold text-white">
              Waiting for host video…
            </p>
            <p className="max-w-xs text-[13px] text-white/45">
              You&apos;re in the room — chat still works. Video appears when the
              host is on camera.
            </p>
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

        {liveId && status !== 'ended' && !isPractice ? (
          <>
            <FloatingReactions liveId={liveId} />
            <LivePollOverlay
              liveId={liveId}
              isHost={isHost}
              hostToolbarEl={isHost ? pollToolbarEl : null}
            />
            <LiveChatOverlay
              liveId={liveId}
              emojiPrice={emojiPrice}
              isHost={isHost}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
