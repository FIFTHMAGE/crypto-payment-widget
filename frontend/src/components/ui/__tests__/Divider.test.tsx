import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Divider } from '../Divider'

describe('Divider', () => {
  it('should render horizontal divider', () => {
    const { container } = render(<Divider />)
    expect(container.firstChild).toHaveClass('border-t')
  })

  it('should render vertical divider', () => {
    const { container } = render(<Divider orientation="vertical" />)
    expect(container.firstChild).toHaveClass('border-l')
  })

  it('should render with text', () => {
    render(<Divider>OR</Divider>)
    expect(screen.getByText('OR')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<Divider className="my-custom-class" />)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })
})

