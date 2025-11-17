import { useState } from 'react'
import { Card, Button, Select } from '../../../components/ui'
import { PaymentCard } from './PaymentCard'
import { usePaymentsQuery } from '../hooks'
import { usePaymentStore } from '../store'

export function PaymentHistoryList() {
  const { filters, setFilters, currentPage, setPage, pageSize } = usePaymentStore()
  const { data, isLoading } = usePaymentsQuery({
    limit: pageSize,
    offset: currentPage * pageSize,
    status: filters.status?.[0],
  })

  const handleFilterChange = (status: string) => {
    setFilters({ status: status ? [status] : [] })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <div className="flex gap-2">
          <Select
            value={filters.status?.[0] || ''}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : data?.payments && data.payments.length > 0 ? (
        <div className="space-y-4">
          {data.payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No payments found</p>
          </div>
        </Card>
      )}

      {data && data.total > pageSize && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {currentPage + 1} of {Math.ceil(data.total / pageSize)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(currentPage + 1)}
            disabled={(currentPage + 1) * pageSize >= data.total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

