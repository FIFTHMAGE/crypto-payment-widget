import { useState } from 'react'
import { Card, Input, Select, Button } from '../../../components/ui'
import { AddressDisplay } from '../../../components/common'

interface AuditEntry {
  id: string
  timestamp: number
  action: string
  category: 'auth' | 'transaction' | 'admin' | 'system'
  actor: string
  target?: string
  details: string
  ip?: string
  userAgent?: string
  status: 'success' | 'failure' | 'warning'
}

const SAMPLE_LOGS: AuditEntry[] = [
  {
    id: '1',
    timestamp: Date.now() - 5 * 60 * 1000,
    action: 'User Login',
    category: 'auth',
    actor: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
    details: 'Successful wallet connection',
    ip: '192.168.1.1',
    status: 'success',
  },
  {
    id: '2',
    timestamp: Date.now() - 15 * 60 * 1000,
    action: 'Payment Processed',
    category: 'transaction',
    actor: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
    target: '0x1234567890123456789012345678901234567890',
    details: 'Payment of 0.05 ETH processed successfully',
    status: 'success',
  },
  {
    id: '3',
    timestamp: Date.now() - 30 * 60 * 1000,
    action: 'Role Changed',
    category: 'admin',
    actor: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
    target: '0x9876543210987654321098765432109876543210',
    details: 'User role changed from user to moderator',
    status: 'success',
  },
  {
    id: '4',
    timestamp: Date.now() - 60 * 60 * 1000,
    action: 'Failed Login Attempt',
    category: 'auth',
    actor: '0xUnknown',
    details: 'Multiple failed authentication attempts',
    ip: '203.0.113.42',
    status: 'failure',
  },
]

export const AuditLog = () => {
  const [logs, setLogs] = useState<AuditEntry[]>(SAMPLE_LOGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [timeRange, setTimeRange] = useState('24h')

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = filterCategory === 'all' || log.category === filterCategory
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'Category', 'Actor', 'Target', 'Details', 'Status'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.action,
        log.category,
        log.actor,
        log.target || '',
        log.details,
        log.status,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${Date.now()}.csv`
    a.click()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      auth: 'blue',
      transaction: 'green',
      admin: 'purple',
      system: 'gray',
    }
    return colors[category as keyof typeof colors] || 'gray'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      success: '✓',
      failure: '✗',
      warning: '⚠',
    }
    return icons[status as keyof typeof icons] || '•'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Audit Log</h2>
        <Button variant="outline" onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      <Card>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="auth">Authentication</option>
            <option value="transaction">Transactions</option>
            <option value="admin">Admin Actions</option>
            <option value="system">System</option>
          </Select>

          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
          </Select>

          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </Select>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Showing {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
          </h3>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition">
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    log.status === 'success'
                      ? 'bg-green-500'
                      : log.status === 'failure'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                >
                  {getStatusIcon(log.status)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{log.action}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs bg-${getCategoryColor(
                        log.category
                      )}-100 text-${getCategoryColor(log.category)}-700`}
                    >
                      {log.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{log.details}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Actor:</span>{' '}
                      <AddressDisplay address={log.actor} />
                    </div>
                    {log.target && (
                      <div>
                        <span className="font-medium">Target:</span>{' '}
                        <AddressDisplay address={log.target} />
                      </div>
                    )}
                    {log.ip && (
                      <div>
                        <span className="font-medium">IP:</span> {log.ip}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Time:</span>{' '}
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No audit logs found matching your criteria
          </div>
        )}
      </Card>
    </div>
  )
}

