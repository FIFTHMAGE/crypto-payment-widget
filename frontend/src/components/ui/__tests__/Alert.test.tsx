import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Alert } from '../Alert'

describe('Alert', () => {
  it('should render alert message', () => {
    render(<Alert>Alert message</Alert>)
    expect(screen.getByText('Alert message')).toBeInTheDocument()
  })

  it('should apply variant styles', () => {
    const { container, rerender } = render(<Alert variant="success">Success</Alert>)
    expect(container.firstChild).toHaveClass('bg-green-50')

    rerender(<Alert variant="error">Error</Alert>)
    expect(container.firstChild).toHaveClass('bg-red-50')

    rerender(<Alert variant="warning">Warning</Alert>)
    expect(container.firstChild).toHaveClass('bg-yellow-50')

    rerender(<Alert variant="info">Info</Alert>)
    expect(container.firstChild).toHaveClass('bg-blue-50')
  })

  it('should render title when provided', () => {
    render(<Alert title="Alert Title">Message</Alert>)
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
  })
})

