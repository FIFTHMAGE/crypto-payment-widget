import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../../test/utils/test-utils'
import { WalletConnect } from '../WalletConnect'
import { mockWagmi } from '../../../../test/mocks/wagmi'

vi.mock('wagmi', () => mockWagmi)

describe('WalletConnect', () => {
  it('should show connect button when disconnected', () => {
    mockWagmi.useAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    })

    render(<WalletConnect />)
    
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument()
  })

  it('should show address when connected', () => {
    render(<WalletConnect />)
    
    expect(screen.getByText(/0x742d...0bEb9/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
  })

  it('should handle connect click', async () => {
    mockWagmi.useAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    })

    const { user } = render(<WalletConnect />)
    
    await user.click(screen.getByRole('button', { name: /connect/i }))
    
    expect(mockWagmi.useConnect().connect).toHaveBeenCalled()
  })

  it('should handle disconnect click', async () => {
    const { user } = render(<WalletConnect />)
    
    await user.click(screen.getByRole('button', { name: /disconnect/i }))
    
    expect(mockWagmi.useDisconnect().disconnect).toHaveBeenCalled()
  })

  it('should show loading state when connecting', () => {
    mockWagmi.useAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: true,
      isDisconnected: false,
    })

    render(<WalletConnect />)
    
    expect(screen.getByText(/connecting/i)).toBeInTheDocument()
  })
})

