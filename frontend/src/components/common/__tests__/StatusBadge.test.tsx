import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('should render pending status', () => {
    const { container } = render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-yellow-100')
  })

  it('should render confirmed status', () => {
    const { container } = render(<StatusBadge status="confirmed" />)
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('should render failed status', () => {
    const { container } = render(<StatusBadge status="failed" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-red-100')
  })
})

