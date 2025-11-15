import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../../test/utils/test-utils'
import { TransactionStatus } from '../TransactionStatus'

describe('TransactionStatus', () => {
  it('should show pending status', () => {
    render(<TransactionStatus status="pending" txHash="0x123" />)
    
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
    expect(screen.getByText(/transaction is being processed/i)).toBeInTheDocument()
  })

  it('should show confirmed status', () => {
    render(<TransactionStatus status="confirmed" txHash="0x123" />)
    
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument()
    expect(screen.getByText(/transaction confirmed/i)).toBeInTheDocument()
  })

  it('should show failed status', () => {
    render(<TransactionStatus status="failed" txHash="0x123" />)
    
    expect(screen.getByText(/failed/i)).toBeInTheDocument()
    expect(screen.getByText(/transaction failed/i)).toBeInTheDocument()
  })

  it('should display transaction hash link', () => {
    render(<TransactionStatus status="confirmed" txHash="0x123abc" />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', expect.stringContaining('0x123abc'))
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should show spinner for pending transactions', () => {
    const { container } = render(<TransactionStatus status="pending" txHash="0x123" />)
    
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})

