import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { AmountDisplay } from '../AmountDisplay'

describe('AmountDisplay', () => {
  it('should display formatted amount', () => {
    render(<AmountDisplay amount="1.5" />)
    expect(screen.getByText('1.5')).toBeInTheDocument()
  })

  it('should display token symbol', () => {
    render(<AmountDisplay amount="1.5" symbol="ETH" />)
    expect(screen.getByText(/ETH/i)).toBeInTheDocument()
  })

  it('should handle large amounts with commas', () => {
    render(<AmountDisplay amount="1000000.50" />)
    expect(screen.getByText(/1,000,000.50/)).toBeInTheDocument()
  })

  it('should show USD value when provided', () => {
    render(<AmountDisplay amount="1.0" usdValue="2000.00" />)
    expect(screen.getByText(/\$2,000.00/)).toBeInTheDocument()
  })
})

