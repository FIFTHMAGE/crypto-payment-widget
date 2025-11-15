import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { PageLayout } from '../PageLayout'

describe('PageLayout', () => {
  it('renders children', () => {
    render(
      <PageLayout title="Test Page">
        <div>Test Content</div>
      </PageLayout>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('displays page title', () => {
    render(
      <PageLayout title="Test Page">
        <div>Content</div>
      </PageLayout>
    )
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('displays subtitle when provided', () => {
    render(
      <PageLayout title="Test Page" subtitle="Test Subtitle">
        <div>Content</div>
      </PageLayout>
    )
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('renders header content', () => {
    render(
      <PageLayout 
        title="Test Page" 
        headerContent={<button>Action</button>}
      >
        <div>Content</div>
      </PageLayout>
    )
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })

  it('includes header and footer', () => {
    render(
      <PageLayout title="Test Page">
        <div>Content</div>
      </PageLayout>
    )
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})

