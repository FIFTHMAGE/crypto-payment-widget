import { useState, useMemo } from 'react'
import { Card, Input, Select, Button } from '../../../components/ui'
import { AddressDisplay, AmountDisplay, StatusBadge } from '../../../components/common'
import { usePaymentStore } from '../../../store'
import { formatTimestamp } from '../../../lib/utils/time'

interface SearchFilters {
  query: string
  status: string
  dateFrom: string
  dateTo: string
  minAmount: string
  maxAmount: string
  sortBy: 'date' | 'amount'
  sortOrder: 'asc' | 'desc'
}

export const TransactionSearch = () => {
  const { transactions } = usePaymentStore()

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc',
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const filteredTransactions = useMemo(() => {
    let result = [...transactions]

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      result = result.filter(
        tx =>
          tx.hash.toLowerCase().includes(query) ||
          tx.from.toLowerCase().includes(query) ||
          tx.to.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(tx => tx.status === filters.status)
    }

    // Date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime()
      result = result.filter(tx => tx.timestamp >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime() + 24 * 60 * 60 * 1000
      result = result.filter(tx => tx.timestamp <= toDate)
    }

    // Amount range
    if (filters.minAmount) {
      result = result.filter(tx => parseFloat(tx.amount) >= parseFloat(filters.minAmount))
    }
    if (filters.maxAmount) {
      result = result.filter(tx => parseFloat(tx.amount) <= parseFloat(filters.maxAmount))
    }

    // Sorting
    result.sort((a, b) => {
      const multiplier = filters.sortOrder === 'asc' ? 1 : -1

      if (filters.sortBy === 'date') {
        return (a.timestamp - b.timestamp) * multiplier
      } else {
        return (parseFloat(a.amount) - parseFloat(b.amount)) * multiplier
      }
    })

    return result
  }, [transactions, filters])

  const handleReset = () => {
    setFilters({
      query: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date',
      sortOrder: 'desc',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Search Transactions</h3>

        <div className="space-y-4">
          <Input
            placeholder="Search by address or transaction hash..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value as 'date' | 'amount' })
                }
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <Select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })
                }
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                fullWidth
              >
                {showAdvanced ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="From Date"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
                <Input
                  label="To Date"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Amount (ETH)"
                  type="number"
                  placeholder="0.0"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                />
                <Input
                  label="Max Amount (ETH)"
                  type="number"
                  placeholder="100.0"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                />
              </div>

              <Button variant="outline" onClick={handleReset} size="sm">
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Results ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No transactions found matching your criteria
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm break-all">{tx.hash}</p>
                      <StatusBadge status={tx.status} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>From:</span>
                        <AddressDisplay address={tx.from} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>To:</span>
                        <AddressDisplay address={tx.to} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <AmountDisplay amount={tx.amount} symbol="ETH" />
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(tx.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

