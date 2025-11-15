import React from 'react'
import type { Address } from 'viem'
import { formatAddress } from '../../lib/utils'
import { useCopyToClipboard } from '../../lib/hooks'
import { Badge } from '../ui'

interface AddressDisplayProps {
  address: Address
  length?: number
  showCopy?: boolean
  showBadge?: boolean
  className?: string
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  length = 4,
  showCopy = true,
  showBadge = false,
  className = '',
}) => {
  const [copied, copy] = useCopyToClipboard()

  const handleCopy = () => {
    copy(address)
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showBadge ? (
        <Badge variant="default" className="font-mono">
          {formatAddress(address, length)}
        </Badge>
      ) : (
        <span className="font-mono text-sm">{formatAddress(address, length)}</span>
      )}
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-primary-600 hover:text-primary-700 transition-colors"
          title={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? '✓' : '📋'}
        </button>
      )}
    </div>
  )
}

