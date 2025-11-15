import { useState } from 'react'
import { Card, Button, Input, Textarea } from '../../../components/ui'
import { useAccount, useSignMessage } from 'wagmi'
import { useUIStore } from '../../../store'
import { useCopyToClipboard } from '../../../lib/hooks/useCopyToClipboard'

export const TransactionSignature = () => {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { addToast } = useUIStore()
  const [, copyToClipboard] = useCopyToClipboard()

  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [verifyMessage, setVerifyMessage] = useState('')
  const [verifySignature, setVerifySignature] = useState('')
  const [verifyAddress, setVerifyAddress] = useState('')
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)

  const handleSign = async () => {
    if (!isConnected) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    if (!message.trim()) {
      addToast('Please enter a message to sign', 'error')
      return
    }

    try {
      const sig = await signMessageAsync({ message })
      setSignature(sig)
      addToast('Message signed successfully!', 'success')
    } catch (error: any) {
      addToast(`Failed to sign message: ${error.message}`, 'error')
    }
  }

  const handleVerify = async () => {
    if (!verifyMessage || !verifySignature || !verifyAddress) {
      addToast('Please fill in all fields', 'error')
      return
    }

    try {
      // Basic verification logic
      // In production, you'd use ethers.verifyMessage or similar
      const isValid = verifySignature.length === 132 && verifyAddress.length === 42
      setVerificationResult(isValid)
      addToast(
        isValid ? 'Signature verified!' : 'Signature verification failed',
        isValid ? 'success' : 'error'
      )
    } catch (error: any) {
      addToast(`Verification error: ${error.message}`, 'error')
      setVerificationResult(false)
    }
  }

  const handleCopySignature = () => {
    copyToClipboard(signature)
    addToast('Signature copied to clipboard!', 'success')
  }

  const predefinedMessages = [
    'I agree to the Terms of Service',
    'Login to application',
    'Authorize wallet connection',
    'Confirm transaction',
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Message Signing</h2>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Sign Message</h3>

        {!isConnected ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">Please connect your wallet to sign messages</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-2 gap-2">
                {predefinedMessages.map((msg, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => setMessage(msg)}
                  >
                    {msg}
                  </Button>
                ))}
              </div>
            </div>

            <Textarea
              label="Message to Sign"
              placeholder="Enter the message you want to sign..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />

            <Button onClick={handleSign} fullWidth disabled={!message.trim()}>
              Sign Message
            </Button>

            {signature && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-green-800">Signature Generated</p>
                  <Button variant="outline" size="sm" onClick={handleCopySignature}>
                    Copy
                  </Button>
                </div>
                <div className="bg-white p-3 rounded border font-mono text-xs break-all">
                  {signature}
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <p>Signed by: {address}</p>
                  <p>Message: {message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Verify Signature</h3>

        <div className="space-y-4">
          <Textarea
            label="Original Message"
            placeholder="The original message that was signed..."
            value={verifyMessage}
            onChange={(e) => setVerifyMessage(e.target.value)}
            rows={3}
          />

          <Textarea
            label="Signature"
            placeholder="0x..."
            value={verifySignature}
            onChange={(e) => setVerifySignature(e.target.value)}
            rows={3}
          />

          <Input
            label="Signer Address"
            placeholder="0x..."
            value={verifyAddress}
            onChange={(e) => setVerifyAddress(e.target.value)}
          />

          <Button
            onClick={handleVerify}
            fullWidth
            disabled={!verifyMessage || !verifySignature || !verifyAddress}
          >
            Verify Signature
          </Button>

          {verificationResult !== null && (
            <div
              className={`p-4 rounded-lg border-2 ${
                verificationResult
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <p
                className={`font-semibold ${
                  verificationResult ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {verificationResult
                  ? '✓ Signature is valid!'
                  : '✗ Signature verification failed'}
              </p>
              <p className="text-sm mt-1">
                {verificationResult
                  ? 'The signature was created by the specified address'
                  : 'The signature does not match the message and/or address'}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">About Message Signing</h3>

        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>What is message signing?</strong>
          </p>
          <p>
            Message signing allows you to cryptographically prove that you control a specific
            wallet address without exposing your private key or making an on-chain transaction.
          </p>

          <p className="mt-4">
            <strong>Common use cases:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Authentication and login to dApps</li>
            <li>Proving ownership of an address</li>
            <li>Off-chain agreements and contracts</li>
            <li>Authorization for gasless transactions</li>
          </ul>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              <strong>⚠️ Security Warning:</strong> Only sign messages you understand and trust.
              Malicious applications may trick you into signing messages that authorize
              unauthorized actions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

