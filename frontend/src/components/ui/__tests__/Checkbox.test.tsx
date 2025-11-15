import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Checkbox } from '../Checkbox'

describe('Checkbox', () => {
  it('should render checkbox', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument()
  })

  it('should handle checked state', async () => {
    const onChange = vi.fn()
    const { user } = render(<Checkbox label="Check me" onChange={onChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should be disabled', () => {
    render(<Checkbox label="Disabled" disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('should start checked', () => {
    render(<Checkbox label="Checked" checked />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})

