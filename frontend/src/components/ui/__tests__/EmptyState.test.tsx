import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('should render with title and description', () => {
    render(<EmptyState title="No data" description="Nothing to show" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Nothing to show')).toBeInTheDocument()
  })

  it('should render action button', async () => {
    const onClick = vi.fn()
    const { user } = render(
      <EmptyState
        title="Empty"
        action={{ label: 'Add item', onClick }}
      />
    )
    
    const button = screen.getByText('Add item')
    await user.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('should render icon when provided', () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        icon={<svg data-testid="custom-icon" />}
      />
    )
    expect(container.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument()
  })
})

