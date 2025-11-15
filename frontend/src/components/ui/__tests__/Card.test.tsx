import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Card } from '../Card'

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should apply padding variants', () => {
    const { container, rerender } = render(<Card padding="sm">Content</Card>)
    expect(container.firstChild).toHaveClass('p-4')

    rerender(<Card padding="md">Content</Card>)
    expect(container.firstChild).toHaveClass('p-6')

    rerender(<Card padding="lg">Content</Card>)
    expect(container.firstChild).toHaveClass('p-8')
  })

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

