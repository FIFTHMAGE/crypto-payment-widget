import { useState, useEffect } from 'react'
import { Card, Button, Tabs } from '../../../components/ui'
import { AmountDisplay } from '../../../components/common'

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState({
    totalTransactions: 1247,
    totalVolume: 125.67,
    totalUsers: 342,
    totalRevenue: 0.31,
    successRate: 98.5,
    avgTransactionValue: 0.10,
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'transaction',
      description: 'New payment processed',
      amount: '0.05 ETH',
      timestamp: Date.now() - 5 * 60 * 1000,
    },
    {
      id: 2,
      type: 'user',
      description: 'New user registered',
      timestamp: Date.now() - 15 * 60 * 1000,
    },
    {
      id: 3,
      type: 'webhook',
      description: 'Webhook triggered',
      timestamp: Date.now() - 30 * 60 * 1000,
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline">Export Report</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              +12%
            </span>
          </div>
          <p className="text-2xl font-bold">{metrics.totalTransactions.toLocaleString()}</p>
        </Card>

        <Card padding="sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-600">Total Volume</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              +8%
            </span>
          </div>
          <p className="text-2xl font-bold">
            <AmountDisplay amount={metrics.totalVolume.toString()} symbol="ETH" />
          </p>
        </Card>

        <Card padding="sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-600">Total Users</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              +5%
            </span>
          </div>
          <p className="text-2xl font-bold">{metrics.totalUsers}</p>
        </Card>

        <Card padding="sm">
          <p className="text-sm text-gray-600 mb-2">Platform Revenue</p>
          <p className="text-2xl font-bold">
            <AmountDisplay amount={metrics.totalRevenue.toString()} symbol="ETH" />
          </p>
        </Card>

        <Card padding="sm">
          <p className="text-sm text-gray-600 mb-2">Success Rate</p>
          <p className="text-2xl font-bold">{metrics.successRate}%</p>
        </Card>

        <Card padding="sm">
          <p className="text-sm text-gray-600 mb-2">Avg. Transaction</p>
          <p className="text-2xl font-bold">
            <AmountDisplay amount={metrics.avgTransactionValue.toString()} symbol="ETH" />
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'settings', label: 'Settings' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    {activity.amount && (
                      <p className="text-sm text-gray-600">{activity.amount}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>API Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Blockchain Connection</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Redis Cache</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                  Degraded
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">User Management</h3>
          <p className="text-gray-600">User management interface coming soon...</p>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Transaction Management</h3>
          <p className="text-gray-600">Transaction management interface coming soon...</p>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
          <p className="text-gray-600">Settings interface coming soon...</p>
        </Card>
      )}
    </div>
  )
}

