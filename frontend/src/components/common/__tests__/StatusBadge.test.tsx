import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders pending status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
  })

  it('renders confirmed status with green color', () => {
    const { container } = render(<StatusBadge status="confirmed" />)
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('renders failed status with red color', () => {
    const { container } = render(<StatusBadge status="failed" />)
    expect(screen.getByText(/failed/i)).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-red-100')
  })

  it('shows status icon', () => {
    render(<StatusBadge status="confirmed" showIcon />)
    const badge = screen.getByText(/confirmed/i).parentElement
    expect(badge).toContainHTML('svg')
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatusBadge status="pending" className="my-custom-badge" />
    )
    expect(container.firstChild).toHaveClass('my-custom-badge')
  })

  it('supports different sizes', () => {
    const { container: small } = render(<StatusBadge status="pending" size="sm" />)
    expect(small.firstChild).toHaveClass('text-xs')

    const { container: large } = render(<StatusBadge status="pending" size="lg" />)
    expect(large.firstChild).toHaveClass('text-base')
  })
})
