import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../utils/test-utils'
import { SimplePayment } from '../../features/payment'
import { mockWagmi } from '../mocks/wagmi'

vi.mock('wagmi', () => mockWagmi)

describe('Payment Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full payment flow', async () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    
    const { user } = render(
      <SimplePayment
        defaultAmount="1.0"
        defaultRecipient="0x456def"
        onSuccess={onSuccess}
        onError={onError}
      />
    )

    // Verify initial render
    expect(screen.getByText(/simple payment/i)).toBeInTheDocument()

    // Find and click pay button
    const payButton = screen.getByRole('button', { name: /pay/i })
    expect(payButton).toBeInTheDocument()

    await user.click(payButton)

    // Verify transaction initiated
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should handle payment errors', async () => {
    const onError = vi.fn()
    mockWagmi.useSendTransaction.mockReturnValue({
      sendTransaction: vi.fn(() => Promise.reject(new Error('Transaction failed'))),
      isPending: false,
    })

    const { user } = render(
      <SimplePayment
        defaultAmount="1.0"
        defaultRecipient="0x456def"
        onError={onError}
      />
    )

    const payButton = screen.getByRole('button', { name: /pay/i })
    await user.click(payButton)

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })
})

