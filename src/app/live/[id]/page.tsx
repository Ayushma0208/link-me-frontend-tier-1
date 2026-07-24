import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LiveView } from '@/views/live/LiveView'

export default async function LivePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ invite?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const invite =
    typeof query.invite === 'string' && query.invite.trim()
      ? query.invite.trim()
      : null
  return (
    <ProtectedRoute>
      <LiveView liveId={id} inviteToken={invite} />
    </ProtectedRoute>
  )
}
