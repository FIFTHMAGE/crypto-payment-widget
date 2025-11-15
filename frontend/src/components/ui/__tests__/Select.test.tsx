import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import { Select } from '../Select'

describe('Select', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ]

  it('should render select with options', () => {
    render(<Select options={options} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('should handle value changes', async () => {
    const onChange = vi.fn()
    const { user } = render(<Select options={options} onChange={onChange} />)
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, '2')
    
    expect(onChange).toHaveBeenCalled()
  })

  it('should show label when provided', () => {
    render(<Select options={options} label="Choose option" />)
    expect(screen.getByText('Choose option')).toBeInTheDocument()
  })

  it('should show placeholder', () => {
    render(<Select options={options} placeholder="Select..." />)
    expect(screen.getByText('Select...')).toBeInTheDocument()
  })

  it('should be disabled', () => {
    render(<Select options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})

