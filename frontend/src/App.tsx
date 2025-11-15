import { useState } from 'react'
import { PageLayout } from './components/layout'
import { Card, Button } from './components/ui'
import { Toast } from './components/ui/Toast'
import { SimplePayment, SmartContractPayment } from './features/payment'
import { WalletConnect, WalletInfo, NetworkSelector } from './features/wallet'
import { useUIStore } from './store'

type PaymentType = 'simple' | 'smart'

function App() {
  const [paymentType, setPaymentType] = useState<PaymentType>('simple')
  const { addToast } = useUIStore()

  const handleSuccess = (txHash: string) => {
    console.log('Transaction successful:', txHash)
    addToast(`Payment successful! ${txHash.slice(0, 10)}...`, 'success')
  }

  const handleError = (error: Error) => {
    console.error('Payment error:', error)
    addToast(`Error: ${error.message}`, 'error')
  }

  return (
    <>
      <PageLayout
        title="Crypto Payment Widget"
        subtitle="Secure payments using WalletConnect & Smart Contracts"
        headerContent={<WalletConnect />}
      >
        <div className="space-y-6">
          {/* Wallet & Network Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <WalletInfo />
            <Card padding="sm">
              <NetworkSelector />
            </Card>
          </div>

          {/* Payment Type Selector */}
          <div className="flex justify-center gap-4">
            <Button
              variant={paymentType === 'simple' ? 'primary' : 'outline'}
              onClick={() => setPaymentType('simple')}
              size="lg"
            >
              Simple Payment
            </Button>
            <Button
              variant={paymentType === 'smart' ? 'primary' : 'outline'}
              onClick={() => setPaymentType('smart')}
              size="lg"
            >
              Smart Contract
            </Button>
          </div>

          {/* Payment Component */}
          {paymentType === 'simple' ? (
            <SimplePayment
              defaultAmount="0.01"
              defaultRecipient="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          ) : (
            <SmartContractPayment />
          )}

          {/* Features Overview */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Features
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Simple Payment</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Direct wallet transfers</li>
                  <li>✓ No smart contract needed</li>
                  <li>✓ Lower gas fees</li>
                  <li>✓ Instant transactions</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Smart Contract</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Escrow payments</li>
                  <li>✓ Split payments</li>
                  <li>✓ Payment tracking</li>
                  <li>✓ Platform fees (0.25%)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
      <Toast />
    </>
  )
}

export default App

