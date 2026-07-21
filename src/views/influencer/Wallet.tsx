import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'

const transactions = [
  { id: '1', type: 'credit' as const, amount: 49.99, description: 'VIP subscription', date: 'Jul 8, 2026' },
  { id: '2', type: 'credit' as const, amount: 2.99, description: 'Image purchase', date: 'Jul 7, 2026' },
  { id: '3', type: 'debit' as const, amount: 100, description: 'Withdrawal to bank', date: 'Jul 5, 2026' },
  { id: '4', type: 'credit' as const, amount: 0.99, description: 'Message tip', date: 'Jul 4, 2026' },
]

export function InfluencerWallet() {
  const balance = 3240.5

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted">Track earnings and withdrawals</p>
      </div>

      <Card className="mb-8 bg-gradient-to-br from-brand-600/20 to-purple-600/20">
        <p className="text-sm text-muted">Available Balance</p>
        <p className="mt-2 text-4xl font-bold">{formatCurrency(balance)}</p>
        <div className="mt-4 flex gap-3">
          <Button>Withdraw</Button>
          <Button variant="secondary">Transaction History</Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest earnings and withdrawals</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              <div>
                <p className="font-medium">{tx.description}</p>
                <p className="text-xs text-muted">{tx.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tx.type === 'credit' ? 'success' : 'warning'}>
                  {tx.type}
                </Badge>
                <span className={tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
