import React from 'react'
import { Badge } from '../ui'
import type { PaymentStatus } from '../../lib/types'

interface StatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const variantMap: Record<PaymentStatus, 'success' | 'error' | 'warning' | 'default'> = {
    confirmed: 'success',
    pending: 'warning',
    failed: 'error',
    refunded: 'default',
  }

  return (
    <Badge variant={variantMap[status]} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

