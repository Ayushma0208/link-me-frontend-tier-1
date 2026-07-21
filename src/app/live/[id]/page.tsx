import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LiveView } from '@/views/live/LiveView'

export default async function LivePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <ProtectedRoute>
      <LiveView liveId={id} />
    </ProtectedRoute>
  )
}
