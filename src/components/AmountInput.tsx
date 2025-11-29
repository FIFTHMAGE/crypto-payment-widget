/**
 * AmountInput Component
 * Input with currency conversion display
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';

export interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  fiatCurrency?: string;
  exchangeRate?: number;
  maxAmount?: string;
  minAmount?: string;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
  showBalance?: boolean;
  balance?: string;
  className?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  currency,
  fiatCurrency = 'USD',
  exchangeRate,
  maxAmount,
  minAmount,
  disabled = false,
  placeholder = '0.00',
  label,
  error,
  showBalance = false,
  balance,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const fiatValue = useMemo(() => {
    if (!exchangeRate || !value) return null;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    return (numValue * exchangeRate).toFixed(2);
  }, [value, exchangeRate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  }, [onChange]);

  const handleMax = useCallback(() => {
    if (maxAmount) {
      onChange(maxAmount);
    } else if (balance) {
      onChange(balance);
    }
  }, [maxAmount, balance, onChange]);

  const formatFiat = useCallback((amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: fiatCurrency,
    }).format(parseFloat(amount));
  }, [fiatCurrency]);

  const isInvalid = useMemo(() => {
    if (!value) return false;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return true;
    if (minAmount && numValue < parseFloat(minAmount)) return true;
    if (maxAmount && numValue > parseFloat(maxAmount)) return true;
    if (balance && numValue > parseFloat(balance)) return true;
    return false;
  }, [value, minAmount, maxAmount, balance]);

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div
        className={`relative rounded-xl border-2 transition-colors ${
          isInvalid || error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
            : isFocused
            ? 'border-blue-500 bg-white dark:bg-gray-800'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Main Input */}
        <div className="flex items-center p-4">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 text-2xl font-semibold bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <div className="flex items-center gap-2">
            {showBalance && balance && (
              <button
                type="button"
                onClick={handleMax}
                disabled={disabled}
                className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              >
                MAX
              </button>
            )}
            <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
              {currency}
            </span>
          </div>
        </div>

        {/* Fiat Conversion */}
        {fiatValue && (
          <div className="px-4 pb-3 -mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ≈ {formatFiat(fiatValue)}
            </p>
          </div>
        )}

        {/* Balance Display */}
        {showBalance && balance && (
          <div className="px-4 pb-3 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Balance:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {parseFloat(balance).toFixed(6)} {currency}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Validation Messages */}
      {isInvalid && !error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {minAmount && parseFloat(value) < parseFloat(minAmount) && (
            <>Minimum amount is {minAmount} {currency}</>
          )}
          {maxAmount && parseFloat(value) > parseFloat(maxAmount) && (
            <>Maximum amount is {maxAmount} {currency}</>
          )}
          {balance && parseFloat(value) > parseFloat(balance) && (
            <>Insufficient balance</>
          )}
        </p>
      )}

      {/* Quick Amount Buttons */}
      {!disabled && exchangeRate && (
        <div className="flex gap-2 mt-3">
          {[10, 25, 50, 100].map((usdAmount) => {
            const cryptoAmount = (usdAmount / exchangeRate).toFixed(6);
            return (
              <button
                key={usdAmount}
                type="button"
                onClick={() => onChange(cryptoAmount)}
                className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                ${usdAmount}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(AmountInput);

