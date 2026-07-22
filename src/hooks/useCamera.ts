'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type CameraStatus = 'idle' | 'starting' | 'active' | 'error'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [error, setError] = useState('')

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setStatus('idle')
  }, [])

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined') return false

    if (!window.isSecureContext) {
      setError('Camera access requires a secure connection (HTTPS).')
      setStatus('error')
      return false
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser.')
      setStatus('error')
      return false
    }

    setError('')
    setStatus('starting')

    try {
      stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setStatus('active')
      return true
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Allow camera access and try again.')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No camera was found on this device.')
      } else {
        setError('Could not start the camera. Please try again.')
      }
      stopCamera()
      setStatus('error')
      return false
    }
  }, [stopCamera])

  useEffect(() => () => stopCamera(), [stopCamera])

  return {
    videoRef,
    status,
    error,
    setError,
    startCamera,
    stopCamera,
    isActive: status === 'active',
  }
}
