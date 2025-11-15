import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../utils/test-utils'
import { WalletConnect } from '../../features/wallet'
import { mockWagmi } from '../mocks/wagmi'

vi.mock('wagmi', () => mockWagmi)

describe('Wallet Connection Integration', () => {
  it('should show connected state when wallet is connected', () => {
    render(<WalletConnect />)
    
    expect(screen.getByText(/0x742d...0bEb9/i)).toBeInTheDocument()
  })

  it('should show connect button when wallet is not connected', () => {
    mockWagmi.useAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    })

    render(<WalletConnect />)
    
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument()
  })

  it('should handle disconnect', async () => {
    const { user } = render(<WalletConnect />)
    
    const disconnectButton = screen.getByRole('button', { name: /disconnect/i })
    await user.click(disconnectButton)

    expect(mockWagmi.useDisconnect().disconnect).toHaveBeenCalled()
  })
})

