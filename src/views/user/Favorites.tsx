import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { mockInfluencers } from '@/data/mock'

export function UserFavorites() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="text-muted">Creators you've saved</p>
      </div>

      <div className="space-y-3">
        {mockInfluencers.map((inf) => (
          <Link key={inf.id} href={`/${inf.username}`}>
            <Card className="flex items-center justify-between hover:border-brand-500/30">
              <div className="flex items-center gap-3">
                <img src={inf.avatar} alt="" className="h-10 w-10 rounded-full" />
                <div>
                  <p className="font-medium">{inf.name}</p>
                  <p className="text-sm text-muted">@{inf.username}</p>
                </div>
              </div>
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
