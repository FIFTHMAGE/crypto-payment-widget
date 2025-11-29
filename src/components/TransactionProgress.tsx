/**
 * TransactionProgress Component
 * Display payment transaction progress with steps
 */

import React, { useMemo } from 'react';

export type TransactionStep = 
  | 'initiated'
  | 'pending'
  | 'broadcasting'
  | 'confirming'
  | 'confirmed'
  | 'failed';

export interface TransactionProgressProps {
  step: TransactionStep;
  transactionHash?: string;
  blockConfirmations?: number;
  requiredConfirmations?: number;
  estimatedTime?: number;
  error?: string;
  amount?: string;
  currency?: string;
  recipient?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  onViewExplorer?: () => void;
  className?: string;
}

export const TransactionProgress: React.FC<TransactionProgressProps> = ({
  step,
  transactionHash,
  blockConfirmations = 0,
  requiredConfirmations = 1,
  estimatedTime,
  error,
  amount,
  currency,
  recipient,
  onCancel,
  onRetry,
  onViewExplorer,
  className = '',
}) => {
  const steps: TransactionStep[] = ['initiated', 'pending', 'broadcasting', 'confirming', 'confirmed'];
  const currentStepIndex = steps.indexOf(step);

  const stepInfo = useMemo(() => ({
    initiated: {
      title: 'Transaction Initiated',
      description: 'Preparing your transaction...',
    },
    pending: {
      title: 'Awaiting Confirmation',
      description: 'Please confirm in your wallet',
    },
    broadcasting: {
      title: 'Broadcasting',
      description: 'Sending to the network...',
    },
    confirming: {
      title: 'Confirming',
      description: `${blockConfirmations}/${requiredConfirmations} confirmations`,
    },
    confirmed: {
      title: 'Complete!',
      description: 'Your transaction was successful',
    },
    failed: {
      title: 'Transaction Failed',
      description: error || 'Something went wrong',
    },
  }), [blockConfirmations, requiredConfirmations, error]);

  const current = stepInfo[step];

  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' | 'failed' => {
    if (step === 'failed') return index === currentStepIndex ? 'failed' : 'pending';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`px-6 py-5 ${
        step === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
        step === 'failed' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
        'bg-gradient-to-r from-blue-500 to-indigo-600'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            step === 'confirmed' ? 'bg-white/20' :
            step === 'failed' ? 'bg-white/20' :
            'bg-white/20'
          }`}>
            {step === 'confirmed' ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : step === 'failed' ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{current.title}</h3>
            <p className="text-white/80">{current.description}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-6">
        <div className="flex justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
            <div 
              className={`h-full transition-all duration-500 ${
                step === 'failed' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Step Dots */}
          {steps.map((s, index) => {
            const status = getStepStatus(index);
            return (
              <div key={s} className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-colors ${
                  status === 'completed' ? 'bg-blue-500 text-white' :
                  status === 'current' ? 'bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900' :
                  status === 'failed' ? 'bg-red-500 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-2 text-xs text-gray-500 dark:text-gray-400 capitalize whitespace-nowrap">
                  {s === 'initiated' ? 'Start' : s}
                </span>
              </div>
            );
          })}
        </div>

        {/* Transaction Details */}
        {(amount || transactionHash || recipient) && (
          <div className="mt-6 space-y-3">
            {amount && currency && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">{amount} {currency}</span>
              </div>
            )}
            {recipient && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">To</span>
                <span className="font-mono text-sm text-gray-900 dark:text-white">{formatAddress(recipient)}</span>
              </div>
            )}
            {transactionHash && (
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">TX Hash</span>
                <span className="font-mono text-sm text-gray-900 dark:text-white">{formatAddress(transactionHash)}</span>
              </div>
            )}
            {estimatedTime && step !== 'confirmed' && step !== 'failed' && (
              <div className="flex justify-between py-2">
                <span className="text-gray-500 dark:text-gray-400">Est. Time</span>
                <span className="text-gray-900 dark:text-white">~{estimatedTime}s</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {step === 'failed' && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          )}
          {step !== 'confirmed' && step !== 'failed' && onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
          {transactionHash && onViewExplorer && (
            <button
              onClick={onViewExplorer}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              View on Explorer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TransactionProgress);

