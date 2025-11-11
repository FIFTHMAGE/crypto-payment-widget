/**
 * Example usage of the PayWithWallet component
 * This file demonstrates different ways to use the payment widget
 */

import React from 'react'
import PayWithWallet from './PayWithWallet'

// Example 1: Basic usage
export const BasicExample: React.FC = () => {
  return (
    <PayWithWallet
      amount="0.01"
      recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    />
  )
}

// Example 2: With success and error handlers
export const WithHandlersExample: React.FC = () => {
  const handleSuccess = (txHash: string) => {
    console.log('Payment successful!', txHash)
    alert(`Payment successful! Transaction: ${txHash}`)
  }

  const handleError = (error: Error) => {
    console.error('Payment failed:', error)
    alert(`Payment failed: ${error.message}`)
  }

  return (
    <PayWithWallet
      amount="0.05"
      recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  )
}

// Example 3: With transaction logging
export const WithLoggingExample: React.FC = () => {
  const handleTransactionLogged = (data: any) => {
    console.log('Transaction logged to backend:', data)
    // You can update UI, send notifications, etc.
  }

  return (
    <PayWithWallet
      amount="0.1"
      recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      onTransactionLogged={handleTransactionLogged}
    />
  )
}

// Example 4: Multi-chain support
// Note: Chains are configured in config/appkit.ts
// Supported chains: Ethereum, Polygon, Arbitrum, Base (configured globally)
export const MultiChainExample: React.FC = () => {
  return (
    <PayWithWallet
      amount="0.01"
      recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    />
  )
}

// Example 5: Custom styling
export const CustomStyledExample: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <PayWithWallet
        amount="0.01"
        recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
        className="shadow-lg"
      />
    </div>
  )
}

// Example 6: Disabled state
export const DisabledExample: React.FC = () => {
  return (
    <PayWithWallet
      amount="0.01"
      recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      disabled={true}
    />
  )
}

// Example 7: E-commerce checkout integration
export const CheckoutExample: React.FC = () => {
  const [amount, setAmount] = React.useState('0.01')
  const [recipient] = React.useState('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')

  const handleSuccess = (txHash: string) => {
    // Redirect to success page
    window.location.href = `/success?tx=${txHash}`
  }

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="amount-section">
        <label>Amount (ETH):</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <PayWithWallet
        amount={amount}
        recipient={recipient}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

