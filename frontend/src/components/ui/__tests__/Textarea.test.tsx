import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Textarea } from '../Textarea'

describe('Textarea', () => {
  it('should render textarea', () => {
    render(<Textarea placeholder="Enter message" />)
    expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument()
  })

  it('should handle input', async () => {
    const onChange = vi.fn()
    const { user } = render(<Textarea onChange={onChange} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test message')
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should show label', () => {
    render(<Textarea label="Message" />)
    expect(screen.getByText('Message')).toBeInTheDocument()
  })

  it('should be disabled', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should show error', () => {
    render(<Textarea error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })
})

