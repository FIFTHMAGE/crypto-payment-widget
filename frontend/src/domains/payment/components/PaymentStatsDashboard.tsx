import { Card } from '../../../components/ui'

export function PaymentStatsDashboard() {
  const stats = [
    { label: 'Total Volume', value: '12.5 ETH', change: '+12%' },
    { label: 'Transactions', value: '47', change: '+8%' },
    { label: 'Success Rate', value: '98.5%', change: '+2%' },
    { label: 'Avg. Amount', value: '0.26 ETH', change: '-3%' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment Statistics</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p
                className={`text-sm ${
                  stat.change.startsWith('+')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.change} from last month
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Payment Distribution</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[85%]" />
              </div>
              <span className="text-sm font-medium">85%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pending</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-[10%]" />
              </div>
              <span className="text-sm font-medium">10%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Failed</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[5%]" />
              </div>
              <span className="text-sm font-medium">5%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

