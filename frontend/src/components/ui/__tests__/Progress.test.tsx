import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Progress } from '../Progress'

describe('Progress', () => {
  it('should render progress bar', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument()
  })

  it('should show correct progress percentage', () => {
    const { container } = render(<Progress value={75} />)
    const progressBar = container.querySelector('[role="progressbar"]')
    expect(progressBar).toHaveAttribute('aria-valuenow', '75')
  })

  it('should show label when provided', () => {
    render(<Progress value={60} label="Loading..." />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle 0% progress', () => {
    const { container } = render(<Progress value={0} />)
    const progressBar = container.querySelector('[role="progressbar"]')
    expect(progressBar).toHaveAttribute('aria-valuenow', '0')
  })

  it('should handle 100% progress', () => {
    const { container } = render(<Progress value={100} />)
    const progressBar = container.querySelector('[role="progressbar"]')
    expect(progressBar).toHaveAttribute('aria-valuenow', '100')
  })
})

