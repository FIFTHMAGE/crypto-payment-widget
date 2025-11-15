import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../../test/utils/test-utils'
import { PaymentForm } from '../PaymentForm'

describe('PaymentForm', () => {
  it('should render payment form fields', () => {
    render(<PaymentForm onSubmit={() => {}} />)
    
    expect(screen.getByLabelText(/recipient/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pay/i })).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    const onSubmit = vi.fn()
    const { user } = render(<PaymentForm onSubmit={onSubmit} />)
    
    await user.type(screen.getByLabelText(/recipient/i), '0x456def')
    await user.type(screen.getByLabelText(/amount/i), '1.5')
    await user.click(screen.getByRole('button', { name: /pay/i }))
    
    expect(onSubmit).toHaveBeenCalledWith({
      recipient: '0x456def',
      amount: '1.5',
    })
  })

  it('should validate required fields', async () => {
    const { user } = render(<PaymentForm onSubmit={() => {}} />)
    
    await user.click(screen.getByRole('button', { name: /pay/i }))
    
    expect(screen.getByText(/recipient is required/i)).toBeInTheDocument()
    expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
  })

  it('should validate address format', async () => {
    const { user } = render(<PaymentForm onSubmit={() => {}} />)
    
    await user.type(screen.getByLabelText(/recipient/i), 'invalid')
    await user.click(screen.getByRole('button', { name: /pay/i }))
    
    expect(screen.getByText(/invalid address/i)).toBeInTheDocument()
  })
})

