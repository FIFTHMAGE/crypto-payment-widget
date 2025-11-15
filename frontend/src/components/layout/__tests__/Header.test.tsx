import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Header } from '../Header'

describe('Header', () => {
  it('should render title', () => {
    render(<Header title="Test App" />)
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <Header title="Test">
        <button>Action</button>
      </Header>
    )
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('should have sticky positioning', () => {
    const { container } = render(<Header title="Test" />)
    expect(container.querySelector('.sticky')).toBeInTheDocument()
  })
})

