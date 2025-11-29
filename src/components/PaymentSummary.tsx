/**
 * PaymentSummary Component
 * Display checkout summary with payment details
 */

import React from 'react';

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
}

export interface PaymentSummaryProps {
  items: PaymentItem[];
  subtotal: number;
  fees?: number;
  tax?: number;
  discount?: number;
  total: number;
  currency: string;
  cryptoAmount?: string;
  cryptoSymbol?: string;
  exchangeRate?: number;
  recipientAddress?: string;
  className?: string;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  items,
  subtotal,
  fees = 0,
  tax = 0,
  discount = 0,
  total,
  currency,
  cryptoAmount,
  cryptoSymbol,
  exchangeRate,
  recipientAddress,
  className = '',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Payment Summary
      </h3>

      {/* Items List */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.name}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(item.quantity * item.unitPrice)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

      {/* Subtotal */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
        </div>

        {fees > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Network Fee</span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(fees)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax</span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Discount</span>
            <span className="text-green-600 dark:text-green-400">-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

      {/* Total */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(total)}
          </p>
          {cryptoAmount && cryptoSymbol && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ≈ {cryptoAmount} {cryptoSymbol}
            </p>
          )}
        </div>
      </div>

      {/* Exchange Rate */}
      {exchangeRate && cryptoSymbol && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            1 {cryptoSymbol} = {formatCurrency(exchangeRate)}
          </p>
        </div>
      )}

      {/* Recipient Address */}
      {recipientAddress && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recipient</p>
          <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
            {truncateAddress(recipientAddress)}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(PaymentSummary);

