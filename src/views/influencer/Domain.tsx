import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { mockInfluencer } from '@/data/mock'

export function InfluencerDomain() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Domain Settings</h1>
        <p className="text-muted">Connect your own domain or use a subdomain</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Subdomain</CardTitle>
            <CardDescription>Your page under the LinkMe app</CardDescription>
          </CardHeader>
          <div className="flex items-center gap-2">
            <input
              type="text"
              defaultValue={mockInfluencer.username}
              className="rounded-xl border border-border bg-surface px-4 py-2"
            />
            <span className="text-muted">.linkme.app</span>
            <Button size="sm">Save</Button>
          </div>
          <p className="mt-2 text-sm text-brand-400">
            https://{mockInfluencer.subdomain}
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Domain</CardTitle>
            <CardDescription>Connect your own domain (e.g., richforever.com)</CardDescription>
          </CardHeader>
          <input
            type="text"
            placeholder="yourdomain.com"
            className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-2"
          />
          <Button variant="secondary">Connect Domain</Button>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DNS Configuration</CardTitle>
            <CardDescription>Add these records to your DNS provider</CardDescription>
          </CardHeader>
          <div className="rounded-xl bg-surface p-4 font-mono text-sm">
            <p>CNAME @ linkme.app</p>
            <p className="mt-2">TXT _linkme verify=abc123</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
