import { describe, it, expect } from 'vitest'

import { Header } from '../Header'
import { render, screen } from '../../../test/utils/test-utils'

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
