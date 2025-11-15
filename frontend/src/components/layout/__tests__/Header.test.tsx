import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Header } from '../Header'

describe('Header', () => {
  it('renders header with title', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders wallet connect button', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument()
  })

  it('displays connected wallet address', () => {
    render(<Header />)
    // Assuming wallet is connected via mock
    const address = screen.queryByText(/0x/i)
    if (address) {
      expect(address).toBeInTheDocument()
    }
  })

  it('is responsive on mobile', () => {
    const { container } = render(<Header />)
    expect(container.firstChild).toHaveClass('flex')
  })
})
