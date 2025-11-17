import { useState } from 'react'
import { Card, Input, Button } from '../../../components/ui'
import { TransactionItem } from './TransactionItem'
import { useTransactionSearch } from '../hooks'

export function TransactionSearchForm() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading } = useTransactionSearch(
    { query },
    { enabled: submitted }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Search Transactions</h2>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Enter transaction hash or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!query}>
            Search
          </Button>
        </form>
      </Card>

      {submitted && (
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <p>Searching...</p>
            </Card>
          ) : data?.transactions && data.transactions.length > 0 ? (
            data.transactions.map((tx) => (
              <TransactionItem key={tx.hash} transaction={tx} />
            ))
          ) : (
            <Card>
              <p className="text-gray-500 text-center">No transactions found</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

