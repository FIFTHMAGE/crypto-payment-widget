import React from 'react'
import { formatEther } from '../../lib/utils'

interface AmountDisplayProps {
  amount: bigint | string
  decimals?: number
  symbol?: string
  className?: string
  showSymbol?: boolean
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  decimals = 4,
  symbol = 'ETH',
  className = '',
  showSymbol = true,
}) => {
  const formattedAmount = typeof amount === 'bigint' 
    ? formatEther(amount, decimals)
    : amount

  return (
    <span className={`font-semibold ${className}`}>
      {formattedAmount}
      {showSymbol && <span className="ml-1 text-gray-600">{symbol}</span>}
    </span>
  )
}

