import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { AddressDisplay } from '../AddressDisplay'

describe('AddressDisplay', () => {
  const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9'

  it('should display formatted address', () => {
    render(<AddressDisplay address={address} />)
    expect(screen.getByText(/0x742d...0bEb9/i)).toBeInTheDocument()
  })

  it('should be copyable', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    })

    const { user } = render(<AddressDisplay address={address} copyable />)
    const copyButton = screen.getByRole('button')
    await user.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(address)
  })

  it('should show full address when showFull is true', () => {
    render(<AddressDisplay address={address} showFull />)
    expect(screen.getByText(address)).toBeInTheDocument()
  })
})

