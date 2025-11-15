import { useMemo } from 'react'
import { Card } from '../../../components/ui'
import { AmountDisplay } from '../../../components/common'
import { usePaymentStore } from '../../../store'

export const PaymentAnalytics = () => {
  const { transactions } = usePaymentStore()

  const analytics = useMemo(() => {
    const total = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0)
    const confirmed = transactions.filter(tx => tx.status === 'confirmed').length
    const pending = transactions.filter(tx => tx.status === 'pending').length
    const failed = transactions.filter(tx => tx.status === 'failed').length

    const avgAmount = transactions.length > 0 ? total / transactions.length : 0

    // Calculate volume over time (last 7 days)
    const now = Date.now()
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    const recentTxs = transactions.filter(
      tx => new Date(tx.timestamp).getTime() > sevenDaysAgo
    )
    const weeklyVolume = recentTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0)

    return {
      total,
      count: transactions.length,
      confirmed,
      pending,
      failed,
      avgAmount,
      weeklyVolume,
      successRate: transactions.length > 0 ? (confirmed / transactions.length) * 100 : 0,
    }
  }, [transactions])

  const stats = [
    {
      label: 'Total Volume',
      value: <AmountDisplay amount={analytics.total.toFixed(4)} symbol="ETH" />,
      change: '+12.5%',
    },
    {
      label: 'Total Transactions',
      value: analytics.count,
      change: `+${analytics.pending} pending`,
    },
    {
      label: 'Success Rate',
      value: `${analytics.successRate.toFixed(1)}%`,
      change: `${analytics.failed} failed`,
    },
    {
      label: 'Avg Transaction',
      value: <AmountDisplay amount={analytics.avgAmount.toFixed(4)} symbol="ETH" />,
      change: 'Last 30 days',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} padding="sm">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{tx.amount} ETH</p>
                <p className="text-sm text-gray-600">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  tx.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : tx.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {tx.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Weekly Volume</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">Chart Placeholder</p>
          {/* TODO: Add chart library and implement */}
        </div>
      </Card>
    </div>
  )
}

