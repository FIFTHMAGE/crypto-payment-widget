import { useState } from 'react'
import PayWithWallet from './components/PayWithWallet'
import SmartPayment from './components/SmartPayment'

type PaymentType = 'simple' | 'smart'

function App() {
  const [paymentType, setPaymentType] = useState<PaymentType>('simple')
  const [amount, setAmount] = useState('0.01')
  const [recipient, setRecipient] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)
  const [transactionData, setTransactionData] = useState<any>(null)

  const handleSuccess = (txHash: string) => {
    setLastTxHash(txHash)
    console.log('Transaction successful:', txHash)
    alert(`Payment successful! Transaction hash: ${txHash}`)
  }

  const handleError = (error: Error) => {
    console.error('Payment error:', error)
    alert(`Error: ${error.message}`)
  }

  const handleTransactionLogged = (data: any) => {
    setTransactionData(data)
    console.log('Transaction logged:', data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Crypto Payment Widget
          </h1>
          <p className="text-gray-600">
            Secure payments using WalletConnect & Smart Contracts
          </p>
        </div>

        {/* Payment Type Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setPaymentType('simple')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              paymentType === 'simple'
                ? 'bg-white text-primary-600 shadow-lg scale-105'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            Simple Payment
          </button>
          <button
            onClick={() => setPaymentType('smart')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              paymentType === 'smart'
                ? 'bg-white text-primary-600 shadow-lg scale-105'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            Smart Contract
          </button>
        </div>

        {paymentType === 'simple' ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Simple Wallet Payment
              </h2>
              <p className="text-gray-600">
                Direct wallet-to-wallet transfers
              </p>
            </div>

            <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (ETH)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="0x..."
              />
            </div>

            <div className="pt-4">
              <PayWithWallet
                amount={amount}
                recipient={recipient}
                onSuccess={handleSuccess}
                onError={handleError}
                onTransactionLogged={handleTransactionLogged}
              />
            </div>

            {lastTxHash && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 mb-2">
                  Last Transaction
                </h3>
                <p className="text-xs font-mono text-green-700 break-all">
                  {lastTxHash}
                </p>
                <a
                  href={`https://etherscan.io/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-800 underline mt-2 inline-block"
                >
                  View on Etherscan
                </a>
              </div>
            )}

            {transactionData && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Transaction Logged
                </h3>
                <pre className="text-xs text-blue-700 overflow-auto">
                  {JSON.stringify(transactionData, null, 2)}
                </pre>
              </div>
            )}
          </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                How it works
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Click "Pay with Wallet" to connect your wallet</li>
                <li>Scan the QR code with your wallet app</li>
                <li>Review and approve the transaction</li>
                <li>Transaction is automatically logged to the backend</li>
              </ol>
            </div>
          </div>
        ) : (
          <SmartPayment />
        )}

        <div className="mt-8 bg-white/80 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
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
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            This is a demo payment widget. Make sure to configure your
            WalletConnect Project ID in the environment variables.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

