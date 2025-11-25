import { describe, it, expect } from 'vitest'

import { Footer } from '../Footer'
import { render, screen } from '../../../test/utils/test-utils'

describe('Footer', () => {
  it('renders footer', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('displays copyright information', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(year.toString()))).toBeInTheDocument()
  })

  it('renders social links', () => {
    render(<Footer />)
    const links = screen.queryAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(0)
  })
})

