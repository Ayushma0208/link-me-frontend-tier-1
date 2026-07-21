import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'

export function InfluencerMonetization() {
  const [coffeePrice, setCoffeePrice] = useState(3)
  const [chatPrice, setChatPrice] = useState(0.99)
  const [callPrice, setCallPrice] = useState(20)
  const [imagePlanPrice, setImagePlanPrice] = useState(9.99)
  const [videoPlanPrice, setVideoPlanPrice] = useState(19.99)

  const saveProfile = useMutation({
    mutationFn: (body: Record<string, number>) =>
      api('/creators/me', { method: 'PATCH', body: JSON.stringify(body) }),
  })

  const createPlan = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api('/creators/me/subscription-plans', { method: 'POST', body: JSON.stringify(body) }),
  })

  function savePricing() {
    saveProfile.mutate({
      coffeeUnitPrice: coffeePrice,
      chatPricePerMessage: chatPrice,
      callPricePerMinute: callPrice,
    })
  }

  function savePlans() {
    createPlan.mutate({
      name: 'Image Access',
      price: imagePlanPrice,
      type: 'image',
      features: ['All photos', 'Behind the scenes'],
    })
    createPlan.mutate({
      name: 'Video Access',
      price: videoPlanPrice,
      type: 'video',
      features: ['All videos & reels'],
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Monetization</h1>
        <p className="text-muted">Set pricing for content and interactions</p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <PricingCard title="Chat (per message)" value={chatPrice} onChange={setChatPrice} />
        <PricingCard title="Video Call (per minute)" value={callPrice} onChange={setCallPrice} />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Buy Me a Coffee</CardTitle>
          <CardDescription>Price per coffee (fans can buy multiple)</CardDescription>
        </CardHeader>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={coffeePrice}
            onChange={(e) => setCoffeePrice(Number(e.target.value))}
            className="w-24 rounded-xl border border-border bg-surface px-3 py-2"
          />
          <span className="text-muted">INR per coffee</span>
        </div>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Separate image and video memberships</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <PricingCard title="Image plan (monthly)" value={imagePlanPrice} onChange={setImagePlanPrice} />
          <PricingCard title="Video plan (monthly)" value={videoPlanPrice} onChange={setVideoPlanPrice} />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={savePricing} disabled={saveProfile.isPending}>
          Save Pricing
        </Button>
        <Button variant="secondary" onClick={savePlans} disabled={createPlan.isPending}>
          Create Plans
        </Button>
      </div>
    </div>
  )
}

function PricingCard({
  title,
  value,
  onChange,
}: {
  title: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <div className="flex items-center gap-2">
        <span className="text-muted">₹</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step="0.01"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2"
        />
      </div>
    </Card>
  )
}
