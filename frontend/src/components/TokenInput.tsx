/**
 * TokenInput - Token amount input component
 * @module components
 */

import React, { useState, useCallback, useMemo } from 'react';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenInputProps {
  token?: Token;
  amount: string;
  balance?: string;
  onAmountChange: (amount: string) => void;
  onTokenSelect?: () => void;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  showBalance?: boolean;
  showMax?: boolean;
  valueUSD?: number;
}

export const TokenInput: React.FC<TokenInputProps> = ({
  token,
  amount,
  balance,
  onAmountChange,
  onTokenSelect,
  label,
  disabled = false,
  readOnly = false,
  error,
  showBalance = true,
  showMax = true,
  valueUSD,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Allow empty string
      if (value === '') {
        onAmountChange('');
        return;
      }

      // Only allow valid number input
      if (/^\d*\.?\d*$/.test(value)) {
        onAmountChange(value);
      }
    },
    [onAmountChange]
  );

  const handleMaxClick = useCallback(() => {
    if (balance) {
      onAmountChange(balance);
    }
  }, [balance, onAmountChange]);

  const formattedBalance = useMemo(() => {
    if (!balance) return null;
    const num = parseFloat(balance);
    if (isNaN(num)) return null;
    return num.toFixed(6);
  }, [balance]);

  const isInsufficientBalance = useMemo(() => {
    if (!balance || !amount) return false;
    return parseFloat(amount) > parseFloat(balance);
  }, [balance, amount]);

  return (
    <div className="token-input w-full">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          {showBalance && formattedBalance && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Balance: {formattedBalance}
            </div>
          )}
        </div>
      )}

      {/* Input Container */}
      <div
        className={`
          relative flex items-center gap-3 p-4
          bg-white dark:bg-gray-800
          border rounded-lg
          transition-all
          ${isFocused ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-300 dark:border-gray-600'}
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Amount Input */}
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          readOnly={readOnly}
          placeholder="0.0"
          className="flex-1 bg-transparent text-2xl font-semibold text-gray-900 dark:text-white outline-none"
        />

        {/* Token Selector */}
        <div className="flex items-center gap-3">
          {showMax && balance && !disabled && !readOnly && (
            <button
              onClick={handleMaxClick}
              className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              MAX
            </button>
          )}

          {onTokenSelect ? (
            <button
              onClick={onTokenSelect}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {token ? (
                <>
                  {token.logoURI ? (
                    <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {token.symbol.substring(0, 1)}
                    </div>
                  )}
                  <span className="font-semibold text-gray-900 dark:text-white">{token.symbol}</span>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span className="text-gray-500">Select token</span>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>
          ) : (
            token && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {token.logoURI ? (
                  <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {token.symbol.substring(0, 1)}
                  </div>
                )}
                <span className="font-semibold text-gray-900 dark:text-white">{token.symbol}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* USD Value */}
      {valueUSD !== undefined && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ≈ ${valueUSD.toFixed(2)} USD
        </div>
      )}

      {/* Error or Warning */}
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

      {isInsufficientBalance && !error && (
        <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-500">
          Insufficient {token?.symbol} balance
        </div>
      )}
    </div>
  );
};

/**
 * Compact version for forms
 */
export const TokenInputCompact: React.FC<TokenInputProps> = ({
  token,
  amount,
  onAmountChange,
  disabled = false,
  readOnly = false,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <input
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '' || /^\d*\.?\d*$/.test(value)) {
            onAmountChange(value);
          }
        }}
        disabled={disabled}
        readOnly={readOnly}
        placeholder="0.0"
        className="flex-1 bg-transparent text-lg font-medium text-gray-900 dark:text-white outline-none"
      />
      {token && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{token.symbol}</span>
      )}
    </div>
  );
};

