import { describe, it, expect } from 'vitest'

import { Spinner } from '../Spinner'
import { render, screen } from '../../../test/utils/test-utils'

describe('Spinner', () => {
  it('should render spinner', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should apply size variants', () => {
    const { container, rerender } = render(<Spinner size="sm" />)
    expect(container.querySelector('.w-4')).toBeInTheDocument()

    rerender(<Spinner size="md" />)
    expect(container.querySelector('.w-8')).toBeInTheDocument()

    rerender(<Spinner size="lg" />)
    expect(container.querySelector('.w-12')).toBeInTheDocument()
  })
})

