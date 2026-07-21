'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/** In-app creator routes redirect to the live public profile. */
export default function UserCreatorProfilePage() {
  const params = useParams<{ username: string }>()
  const router = useRouter()
  const username = String(params.username ?? '')
    .replace(/^@/, '')
    .toLowerCase()

  useEffect(() => {
    if (!username) {
      router.replace('/user/explore')
      return
    }
    router.replace(`/${username}`)
  }, [router, username])

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-white/45">
      Opening creator profile…
    </div>
  )
}
