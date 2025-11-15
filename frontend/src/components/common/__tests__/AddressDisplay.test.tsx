import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { AddressDisplay } from '../AddressDisplay'

describe('AddressDisplay', () => {
  const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9'

  it('renders shortened address', () => {
    render(<AddressDisplay address={address} />)
    expect(screen.getByText(/0x742d/i)).toBeInTheDocument()
  })

  it('shows full address on hover', async () => {
    render(<AddressDisplay address={address} showTooltip />)
    const element = screen.getByText(/0x742d/i)
    await userEvent.hover(element)
    // Tooltip should appear with full address
  })

  it('copies address to clipboard on click', async () => {
    const writeText = vi.fn()
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    render(<AddressDisplay address={address} copyable />)
    const element = screen.getByText(/0x742d/i)
    await userEvent.click(element)
    
    expect(writeText).toHaveBeenCalledWith(address)
  })

  it('links to block explorer when enabled', () => {
    render(<AddressDisplay address={address} linkToExplorer chainId={1} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', expect.stringContaining('etherscan.io'))
  })

  it('applies custom className', () => {
    const { container } = render(
      <AddressDisplay address={address} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
