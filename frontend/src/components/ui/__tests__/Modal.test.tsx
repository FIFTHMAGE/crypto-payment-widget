import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Modal } from '../Modal'

describe('Modal', () => {
  it('should render when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Modal content
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        Modal content
      </Modal>
    )
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('should call onClose when clicking overlay', async () => {
    const onClose = vi.fn()
    const { user } = render(
      <Modal isOpen={true} onClose={onClose}>
        Modal content
      </Modal>
    )

    const overlay = screen.getByTestId('modal-overlay')
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('should render title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title">
        Content
      </Modal>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})

