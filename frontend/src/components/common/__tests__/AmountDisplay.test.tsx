import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { AmountDisplay } from '../AmountDisplay'

describe('AmountDisplay', () => {
  it('displays formatted amount', () => {
    render(<AmountDisplay amount="1234567890000000000" />)
    expect(screen.getByText(/1\.23/i)).toBeInTheDocument()
  })

  it('shows token symbol', () => {
    render(<AmountDisplay amount="1000000000000000000" symbol="ETH" />)
    expect(screen.getByText(/ETH/i)).toBeInTheDocument()
  })

  it('displays USD value when provided', () => {
    render(<AmountDisplay amount="1000000000000000000" usdValue={2000} />)
    expect(screen.getByText(/\$2,000/i)).toBeInTheDocument()
  })

  it('handles zero amounts', () => {
    render(<AmountDisplay amount="0" />)
    expect(screen.getByText(/0\.00/i)).toBeInTheDocument()
  })

  it('applies custom decimal places', () => {
    render(<AmountDisplay amount="1234567890000000000" decimals={4} />)
    expect(screen.getByText(/1\.2346/i)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <AmountDisplay amount="1000000000000000000" className="text-green-500" />
    )
    expect(container.firstChild).toHaveClass('text-green-500')
  })
})
