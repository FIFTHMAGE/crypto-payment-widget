import { useState } from 'react'
import { Card, Button, Select, Checkbox } from '../../../components/ui'
import { usePaymentStore } from '../../../store'
import { useUIStore } from '../../../store'

type ExportFormat = 'json' | 'csv' | 'pdf'

interface ExportOptions {
  format: ExportFormat
  includeMetadata: boolean
  dateRange: 'all' | 'week' | 'month' | 'year'
  includeFields: string[]
}

const AVAILABLE_FIELDS = [
  'Transaction Hash',
  'From Address',
  'To Address',
  'Amount',
  'Status',
  'Timestamp',
  'Gas Used',
  'Block Number',
]

export const DataExporter = () => {
  const { transactions } = usePaymentStore()
  const { addToast } = useUIStore()

  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    dateRange: 'all',
    includeFields: AVAILABLE_FIELDS,
  })

  const toggleField = (field: string) => {
    setOptions(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(field)
        ? prev.includeFields.filter(f => f !== field)
        : [...prev.includeFields, field],
    }))
  }

  const filterTransactionsByDate = () => {
    const now = Date.now()
    const filters = {
      all: () => true,
      week: (timestamp: number) => now - timestamp < 7 * 24 * 60 * 60 * 1000,
      month: (timestamp: number) => now - timestamp < 30 * 24 * 60 * 60 * 1000,
      year: (timestamp: number) => now - timestamp < 365 * 24 * 60 * 60 * 1000,
    }

    return transactions.filter(tx =>
      filters[options.dateRange](tx.timestamp)
    )
  }

  const exportToJSON = () => {
    const data = filterTransactionsByDate()
    const exportData = {
      ...(options.includeMetadata && {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalRecords: data.length,
          dateRange: options.dateRange,
        },
      }),
      transactions: data,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    downloadFile(blob, 'transactions.json')
  }

  const exportToCSV = () => {
    const data = filterTransactionsByDate()
    
    const headers = options.includeFields.join(',')
    const rows = data.map(tx =>
      [
        tx.hash,
        tx.from,
        tx.to,
        tx.amount,
        tx.status,
        new Date(tx.timestamp).toISOString(),
        'N/A', // Gas used
        'N/A', // Block number
      ].join(',')
    )

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    downloadFile(blob, 'transactions.csv')
  }

  const exportToPDF = () => {
    addToast('PDF export not yet implemented', 'info')
    // TODO: Implement PDF export
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    addToast(`Exported ${filename} successfully!`, 'success')
  }

  const handleExport = () => {
    switch (options.format) {
      case 'json':
        exportToJSON()
        break
      case 'csv':
        exportToCSV()
        break
      case 'pdf':
        exportToPDF()
        break
    }
  }

  const filteredCount = filterTransactionsByDate().length

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Export Transaction Data</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <Select
            value={options.format}
            onChange={(e) =>
              setOptions({ ...options, format: e.target.value as ExportFormat })
            }
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <Select
            value={options.dateRange}
            onChange={(e) =>
              setOptions({
                ...options,
                dateRange: e.target.value as ExportOptions['dateRange'],
              })
            }
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </Select>
        </div>

        <div>
          <Checkbox
            label="Include metadata"
            checked={options.includeMetadata}
            onChange={(e) =>
              setOptions({ ...options, includeMetadata: e.target.checked })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Include Fields
          </label>
          <div className="space-y-2">
            {AVAILABLE_FIELDS.map((field) => (
              <Checkbox
                key={field}
                label={field}
                checked={options.includeFields.includes(field)}
                onChange={() => toggleField(field)}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-4">
            {filteredCount} transaction{filteredCount !== 1 ? 's' : ''} will be exported
          </p>
          <Button onClick={handleExport} fullWidth disabled={filteredCount === 0}>
            Export Data
          </Button>
        </div>
      </div>
    </Card>
  )
}

