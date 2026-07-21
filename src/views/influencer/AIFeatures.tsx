import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function InfluencerAIFeatures() {
  const features = [
    {
      name: 'AI Chat',
      description: 'Automated chat with bilingual Tanglish support',
      enabled: true,
    },
    {
      name: 'AI Voice Call',
      description: 'AI-powered voice interactions with fans',
      enabled: true,
    },
    {
      name: 'AI Clothes Try-On',
      description: 'Virtual fashion try-on for your audience',
      enabled: false,
    },
    {
      name: 'Image + Chat Bundle',
      description: 'Combined image sharing with chat responses',
      enabled: true,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Features</h1>
        <p className="text-muted">Configure AI-powered interactions</p>
      </div>

      <div className="space-y-4">
        {features.map((feature) => (
          <Card key={feature.name} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{feature.name}</h3>
                <Badge variant={feature.enabled ? 'success' : 'default'}>
                  {feature.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{feature.description}</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked={feature.enabled}
                className="h-5 w-5 rounded"
              />
            </label>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Language Settings</CardTitle>
          <CardDescription>
            Enable combined language conversations (e.g., Tamil + English Tanglish)
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {['English', 'Tamil', 'Tanglish', 'Hindi', 'Spanish'].map((lang) => (
            <button
              key={lang}
              type="button"
              className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-brand-500/50"
            >
              {lang}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
