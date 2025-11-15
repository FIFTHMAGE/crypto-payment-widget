import React from 'react'
import { blockchainService } from '../../../services'

interface TransactionStatusProps {
  txHash: string
  chainId: number
  status?: 'pending' | 'confirmed' | 'failed'
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  txHash,
  chainId,
  status = 'confirmed',
}) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      label: 'Pending',
    },
    confirmed: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      label: 'Confirmed',
    },
    failed: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      label: 'Failed',
    },
  }

  const config = statusConfig[status]
  const explorerUrl = blockchainService.getTransactionUrl(txHash, chainId)

  return (
    <div className={`p-4 border rounded-lg ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-semibold ${config.text}`}>
          {config.label}
        </span>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs ${config.text} hover:underline`}
        >
          View Explorer →
        </a>
      </div>
      <p className={`text-xs font-mono ${config.text} break-all`}>{txHash}</p>
    </div>
  )
}

