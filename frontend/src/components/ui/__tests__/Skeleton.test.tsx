import { describe, it, expect } from 'vitest'
import { render } from '../../../test/utils/test-utils'
import { Skeleton } from '../Skeleton'

describe('Skeleton', () => {
  it('should render skeleton loader', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should apply width and height', () => {
    const { container } = render(<Skeleton width="200px" height="50px" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.style.width).toBe('200px')
    expect(skeleton.style.height).toBe('50px')
  })

  it('should render circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  it('should render text variant', () => {
    const { container } = render(<Skeleton variant="text" />)
    expect(container.firstChild).toHaveClass('rounded')
  })
})

