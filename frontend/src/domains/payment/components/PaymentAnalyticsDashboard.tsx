import { Card } from '../../../components/ui'
import { usePaymentsQuery } from '../hooks'

export function PaymentAnalyticsDashboard() {
  const { data } = usePaymentsQuery({ limit: 100 })

  const stats = {
    total: data?.total || 0,
    completed: data?.payments?.filter((p) => p.status === 'completed').length || 0,
    pending: data?.payments?.filter((p) => p.status === 'pending').length || 0,
    volume: '0 ETH',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment Analytics</h2>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600">Total Payments</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-3xl font-bold mt-2 text-green-600">
            {stats.completed}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-3xl font-bold mt-2 text-yellow-600">
            {stats.pending}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600">Total Volume</div>
          <div className="text-3xl font-bold mt-2">{stats.volume}</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Payment Trends</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">Chart placeholder</p>
        </div>
      </Card>
    </div>
  )
}

