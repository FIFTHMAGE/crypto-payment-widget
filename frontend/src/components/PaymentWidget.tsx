/**
 * PaymentWidget - Main payment widget component
 * @module components
 */

import React, { useState, useCallback, useEffect } from 'react';
import { usePaymentFlow, PaymentStep } from '../hooks/usePaymentFlow';

export interface PaymentWidgetProps {
  recipient?: string;
  amount?: string;
  token?: string;
  metadata?: Record<string, any>;
  onSuccess?: (txHash: string) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark';
  primaryColor?: string;
}

export const PaymentWidget: React.FC<PaymentWidgetProps> = ({
  recipient: initialRecipient,
  amount: initialAmount,
  token: initialToken,
  metadata,
  onSuccess,
  onCancel,
  onError,
  theme = 'light',
  primaryColor = '#3b82f6',
}) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const {
    state,
    nextStep,
    previousStep,
    setRecipient,
    setToken,
    setAmount,
    setMetadata,
    markAsApproved,
    complete,
    cancel,
    setError,
    canGoBack,
    canProceed,
    getProgress,
  } = usePaymentFlow(
    {
      recipient: initialRecipient || '',
      amount: initialAmount || '',
      token: initialToken || '',
      metadata,
    },
    {
      onComplete: onSuccess,
      onCancel,
      onError,
    }
  );

  // Connect wallet on mount if not connected
  useEffect(() => {
    if (state.step === PaymentStep.CONNECT_WALLET && !walletConnected) {
      // Auto-connect logic would go here
    }
  }, [state.step, walletConnected]);

  const handleConnectWallet = useCallback(async () => {
    try {
      // Mock wallet connection
      const address = '0x' + Math.random().toString(16).substring(2, 42);
      setWalletAddress(address);
      setWalletConnected(true);
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    }
  }, [nextStep, setError]);

  const handleTokenSelect = useCallback(
    (tokenAddress: string, requiresApproval: boolean) => {
      setToken(tokenAddress, requiresApproval);
      nextStep();
    },
    [setToken, nextStep]
  );

  const handleAmountSubmit = useCallback(() => {
    if (canProceed) {
      nextStep();
    }
  }, [canProceed, nextStep]);

  const handleApprove = useCallback(async () => {
    try {
      // Mock approval
      await new Promise((resolve) => setTimeout(resolve, 2000));
      markAsApproved();
      nextStep();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Approval failed');
    }
  }, [markAsApproved, nextStep, setError]);

  const handleConfirm = useCallback(async () => {
    try {
      nextStep(); // Move to processing
      // Mock transaction
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const txHash = '0x' + Math.random().toString(16).substring(2, 66);
      complete(txHash);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Transaction failed');
    }
  }, [nextStep, complete, setError]);

  const renderStep = () => {
    switch (state.step) {
      case PaymentStep.CONNECT_WALLET:
        return (
          <ConnectWalletStep
            onConnect={handleConnectWallet}
            primaryColor={primaryColor}
          />
        );

      case PaymentStep.SELECT_TOKEN:
        return (
          <SelectTokenStep
            selectedToken={state.token}
            onSelect={handleTokenSelect}
            primaryColor={primaryColor}
          />
        );

      case PaymentStep.ENTER_AMOUNT:
        return (
          <EnterAmountStep
            amount={state.amount}
            recipient={state.recipient}
            token={state.token}
            onAmountChange={setAmount}
            onRecipientChange={setRecipient}
            onSubmit={handleAmountSubmit}
            canProceed={canProceed}
            primaryColor={primaryColor}
          />
        );

      case PaymentStep.REVIEW:
        return (
          <ReviewStep
            amount={state.amount}
            recipient={state.recipient}
            token={state.token}
            onConfirm={nextStep}
            primaryColor={primaryColor}
          />
        );

      case PaymentStep.APPROVE_TOKEN:
        return (
          <ApproveStep
            token={state.token}
            amount={state.amount}
            onApprove={handleApprove}
            primaryColor={primaryColor}
          />
        );

      case PaymentStep.CONFIRM_TRANSACTION:
        return (
          <ConfirmTransactionStep
            amount={state.amount}
            recipient={state.recipient}
            token={state.token}
            onConfirm={handleConfirm}
            primaryColor={primaryColor}
          />
        );

      case PaymentStep.PROCESSING:
        return <ProcessingStep primaryColor={primaryColor} />;

      case PaymentStep.SUCCESS:
        return (
          <SuccessStep txHash={state.transactionHash || ''} primaryColor={primaryColor} />
        );

      case PaymentStep.ERROR:
        return <ErrorStep error={state.error || 'Unknown error'} onRetry={previousStep} />;

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div
      className={`payment-widget ${theme} w-full max-w-md mx-auto`}
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Crypto Payment
          </h2>
          {walletAddress && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatAddress(walletAddress)}
            </p>
          )}
        </div>

        {/* Progress bar */}
        {state.step !== PaymentStep.SUCCESS && state.step !== PaymentStep.ERROR && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${getProgress()}%`,
                backgroundColor: primaryColor,
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">{renderStep()}</div>

        {/* Footer */}
        {canGoBack && (
          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={previousStep}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Step components (simplified)
const ConnectWalletStep: React.FC<{ onConnect: () => void; primaryColor: string }> = ({
  onConnect,
  primaryColor,
}) => (
  <div className="text-center space-y-4">
    <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
    <p className="text-gray-600 dark:text-gray-400">
      Connect your wallet to continue with the payment
    </p>
    <button
      onClick={onConnect}
      className="w-full py-3 px-4 rounded-lg text-white font-medium"
      style={{ backgroundColor: primaryColor }}
    >
      Connect Wallet
    </button>
  </div>
);

const SelectTokenStep: React.FC<{
  selectedToken: string;
  onSelect: (token: string, requiresApproval: boolean) => void;
  primaryColor: string;
}> = ({ selectedToken, onSelect, primaryColor }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">Select Token</h3>
    <div className="space-y-2">
      {['ETH', 'USDC', 'USDT'].map((token) => (
        <button
          key={token}
          onClick={() => onSelect(token, token !== 'ETH')}
          className={`w-full p-4 border rounded-lg text-left hover:border-blue-500 ${
            selectedToken === token ? 'border-blue-500' : 'border-gray-300'
          }`}
        >
          {token}
        </button>
      ))}
    </div>
  </div>
);

const EnterAmountStep: React.FC<{
  amount: string;
  recipient: string;
  token: string;
  onAmountChange: (amount: string) => void;
  onRecipientChange: (recipient: string) => void;
  onSubmit: () => void;
  canProceed: boolean;
  primaryColor: string;
}> = ({
  amount,
  recipient,
  onAmountChange,
  onRecipientChange,
  onSubmit,
  canProceed,
  primaryColor,
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">Recipient</label>
      <input
        type="text"
        value={recipient}
        onChange={(e) => onRecipientChange(e.target.value)}
        className="w-full p-3 border rounded-lg"
        placeholder="0x..."
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">Amount</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        className="w-full p-3 border rounded-lg"
        placeholder="0.0"
      />
    </div>
    <button
      onClick={onSubmit}
      disabled={!canProceed}
      className="w-full py-3 px-4 rounded-lg text-white font-medium disabled:opacity-50"
      style={{ backgroundColor: primaryColor }}
    >
      Continue
    </button>
  </div>
);

const ReviewStep: React.FC<{
  amount: string;
  recipient: string;
  token: string;
  onConfirm: () => void;
  primaryColor: string;
}> = ({ amount, recipient, token, onConfirm, primaryColor }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">Review Payment</h3>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Amount:</span>
        <span className="font-medium">
          {amount} {token}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">To:</span>
        <span className="font-medium font-mono">{formatAddress(recipient)}</span>
      </div>
    </div>
    <button
      onClick={onConfirm}
      className="w-full py-3 px-4 rounded-lg text-white font-medium"
      style={{ backgroundColor: primaryColor }}
    >
      Confirm
    </button>
  </div>
);

const ApproveStep: React.FC<{
  token: string;
  amount: string;
  onApprove: () => void;
  primaryColor: string;
}> = ({ token, amount, onApprove, primaryColor }) => (
  <div className="text-center space-y-4">
    <h3 className="text-xl font-semibold">Approve Token</h3>
    <p className="text-gray-600">
      Approve {amount} {token} for spending
    </p>
    <button
      onClick={onApprove}
      className="w-full py-3 px-4 rounded-lg text-white font-medium"
      style={{ backgroundColor: primaryColor }}
    >
      Approve
    </button>
  </div>
);

const ConfirmTransactionStep: React.FC<{
  amount: string;
  recipient: string;
  token: string;
  onConfirm: () => void;
  primaryColor: string;
}> = ({ amount, recipient, token, onConfirm, primaryColor }) => (
  <div className="text-center space-y-4">
    <h3 className="text-xl font-semibold">Confirm in Wallet</h3>
    <p className="text-gray-600">
      Sending {amount} {token} to {formatAddress(recipient)}
    </p>
    <button
      onClick={onConfirm}
      className="w-full py-3 px-4 rounded-lg text-white font-medium"
      style={{ backgroundColor: primaryColor }}
    >
      Confirm
    </button>
  </div>
);

const ProcessingStep: React.FC<{ primaryColor: string }> = ({ primaryColor }) => (
  <div className="text-center space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: primaryColor }} />
    <h3 className="text-xl font-semibold">Processing...</h3>
    <p className="text-gray-600">Please wait while your transaction is being processed</p>
  </div>
);

const SuccessStep: React.FC<{ txHash: string; primaryColor: string }> = ({
  txHash,
  primaryColor,
}) => (
  <div className="text-center space-y-4">
    <div className="text-green-500 text-5xl">✓</div>
    <h3 className="text-xl font-semibold">Payment Successful!</h3>
    <p className="text-sm text-gray-600 break-all">Transaction: {txHash}</p>
  </div>
);

const ErrorStep: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="text-center space-y-4">
    <div className="text-red-500 text-5xl">✕</div>
    <h3 className="text-xl font-semibold">Payment Failed</h3>
    <p className="text-sm text-gray-600">{error}</p>
    <button
      onClick={onRetry}
      className="w-full py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
    >
      Try Again
    </button>
  </div>
);

function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

