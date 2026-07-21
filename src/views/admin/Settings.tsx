import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'

export function AdminSettings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted">Platform configuration</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Screenshot Protection</CardTitle>
            <CardDescription>
              Blank black screen when users attempt screenshots
            </CardDescription>
          </CardHeader>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            <span className="text-sm">Enable screenshot protection globally</span>
          </label>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect external platforms</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            <IntegrationRow name="Snaptube" connected={false} />
            <IntegrationRow name="Snapchat" connected={false} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Domains</CardTitle>
            <CardDescription>
              Allow influencers to connect their own domain or subdomain
            </CardDescription>
          </CardHeader>
          <Button variant="secondary">Configure DNS Settings</Button>
        </Card>
      </div>
    </div>
  )
}

function IntegrationRow({ name, connected }: { name: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-4">
      <span className="font-medium">{name}</span>
      <Button variant={connected ? 'secondary' : 'primary'} size="sm">
        {connected ? 'Connected' : 'Connect'}
      </Button>
    </div>
  )
}
