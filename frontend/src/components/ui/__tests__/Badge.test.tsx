import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('should render badge with text', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should apply variant styles', () => {
    const { container, rerender } = render(<Badge variant="success">Success</Badge>)
    expect(container.firstChild).toHaveClass('bg-green-100')

    rerender(<Badge variant="error">Error</Badge>)
    expect(container.firstChild).toHaveClass('bg-red-100')

    rerender(<Badge variant="warning">Warning</Badge>)
    expect(container.firstChild).toHaveClass('bg-yellow-100')

    rerender(<Badge variant="info">Info</Badge>)
    expect(container.firstChild).toHaveClass('bg-blue-100')
  })

  it('should apply size styles', () => {
    const { container, rerender } = render(<Badge size="sm">Small</Badge>)
    expect(container.firstChild).toHaveClass('text-xs')

    rerender(<Badge size="md">Medium</Badge>)
    expect(container.firstChild).toHaveClass('text-sm')

    rerender(<Badge size="lg">Large</Badge>)
    expect(container.firstChild).toHaveClass('text-base')
  })
})

