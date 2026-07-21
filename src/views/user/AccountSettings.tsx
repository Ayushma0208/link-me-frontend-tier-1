'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, Loader2 } from 'lucide-react'

import { SharedInput } from '@/components/auth/SharedInput'
import { api } from '@/lib/api'
import {
  mapBackendUser,
  type BackendPublicUser,
} from '@/lib/auth-map'
import { uploadMediaFile } from '@/lib/media-upload'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

const MAX_AVATAR_BYTES = 900_000

async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file')
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('Image must be under 900KB')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read image'))
    }
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

async function uploadAvatarViaMedia(file: File): Promise<string | null> {
  try {
    const { url } = await uploadMediaFile({
      file,
      purpose: 'AVATAR',
      type: 'IMAGE',
    })
    return url
  } catch {
    return null
  }
}

export function AccountSettings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const fileRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    void fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (!user) return
    setDisplayName(user.name ?? '')
    setUsername(user.username ?? '')
    setAvatarUrl(user.avatar ?? null)
  }, [user])

  async function handleAvatarPick(file: File | null) {
    if (!file) return
    setProfileError('')
    setProfileSuccess('')
    setUploadingAvatar(true)
    try {
      const mediaUrl = await uploadAvatarViaMedia(file)
      if (mediaUrl) {
        setAvatarUrl(mediaUrl)
        setProfileSuccess('Profile photo ready — save your account details to apply it.')
        return
      }
      const dataUrl = await fileToDataUrl(file)
      setAvatarUrl(dataUrl)
      setProfileSuccess('Profile photo ready — save your account details to apply it.')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not update photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setSavingProfile(true)
    try {
      const payload: {
        displayName?: string
        username?: string
        avatarUrl?: string | null
      } = {}

      if (displayName.trim() && displayName.trim() !== user?.name) {
        payload.displayName = displayName.trim()
      }
      if (username.trim() && username.trim() !== user?.username) {
        payload.username = username.trim().toLowerCase()
      }
      if ((avatarUrl ?? null) !== (user?.avatar ?? null)) {
        payload.avatarUrl = avatarUrl
      }

      if (Object.keys(payload).length === 0) {
        setProfileSuccess('No changes to save.')
        return
      }

      const data = await api<{ user: BackendPublicUser }>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      setUser(mapBackendUser(data.user))
      setProfileSuccess('Account updated.')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not save account')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      await api('/auth/me/password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Password updated.')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not update password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7">
      <Link
        href="/user/settings"
        className="inline-flex items-center gap-2 text-[13px] text-white/45 hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to settings
      </Link>

      <header className="space-y-1">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase"
        >
          Account
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl font-extrabold tracking-tight text-white"
        >
          Profile & security
        </motion.h1>
        <p className="text-[15px] text-white/45">
          Update your username, password, and profile picture.
        </p>
      </header>

      <form
        onSubmit={handleSaveProfile}
        className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6"
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar || savingProfile}
            className={cn(
              'relative size-24 overflow-hidden rounded-full border border-white/15 bg-white/[0.06]',
              'transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40'
            )}
            aria-label="Change profile picture"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-2xl font-semibold text-white/50">
                {(displayName || username || 'U').slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1.5 text-[10px] font-medium tracking-wide text-white uppercase">
              {uploadingAvatar ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Camera className="size-3" />
              )}
              Photo
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-white">Profile picture</p>
            <p className="mt-1 text-[13px] text-white/40">
              JPG, PNG, or WebP up to 900KB.
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar || savingProfile}
              className="mt-3 text-[13px] font-medium text-sky-300 hover:text-sky-200 disabled:opacity-50"
            >
              {uploadingAvatar ? 'Uploading…' : 'Choose image'}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              e.target.value = ''
              void handleAvatarPick(file)
            }}
          />
        </div>

        <SharedInput
          label="Display name"
          accent="user"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
        />
        <SharedInput
          label="Username"
          accent="user"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
          autoComplete="username"
        />
        <SharedInput
          label="Email"
          accent="user"
          value={user?.email ?? ''}
          disabled
          readOnly
        />

        {profileError ? (
          <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
            {profileError}
          </p>
        ) : null}
        {profileSuccess ? (
          <p className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-2.5 text-[13px] text-emerald-200">
            {profileSuccess}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={savingProfile || uploadingAvatar}
          className={cn(
            'flex h-12 w-full items-center justify-center rounded-full',
            'bg-white text-[15px] font-semibold text-zinc-900',
            'transition hover:bg-neutral-100 disabled:opacity-50'
          )}
        >
          {savingProfile ? 'Saving…' : 'Save account'}
        </button>
      </form>

      <form
        onSubmit={handleChangePassword}
        className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6"
      >
        <div>
          <h2 className="text-[16px] font-bold text-white">Password</h2>
          <p className="mt-1 text-[13px] text-white/40">
            Use at least 8 characters with a letter and a number.
          </p>
        </div>

        <SharedInput
          label="Current password"
          accent="user"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <SharedInput
          label="New password"
          accent="user"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <SharedInput
          label="Confirm new password"
          accent="user"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {passwordError ? (
          <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-200">
            {passwordError}
          </p>
        ) : null}
        {passwordSuccess ? (
          <p className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-2.5 text-[13px] text-emerald-200">
            {passwordSuccess}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={savingPassword}
          className={cn(
            'flex h-12 w-full items-center justify-center rounded-full',
            'border border-white/15 bg-white/[0.06] text-[15px] font-semibold text-white',
            'transition hover:bg-white/[0.1] disabled:opacity-50'
          )}
        >
          {savingPassword ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
