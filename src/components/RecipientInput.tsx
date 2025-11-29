/**
 * RecipientInput Component
 * Address input with validation and ENS resolution
 */

import React, { useState, useCallback, useEffect } from 'react';

export interface RecipientInputProps {
  value: string;
  onChange: (value: string, resolvedAddress?: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  showValidation?: boolean;
  onValidate?: (isValid: boolean, error?: string) => void;
  className?: string;
}

export const RecipientInput: React.FC<RecipientInputProps> = ({
  value,
  onChange,
  label = 'Recipient',
  placeholder = '0x... or ENS name',
  disabled = false,
  showValidation = true,
  onValidate,
  className = '',
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const isAddress = (val: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(val);
  };

  const isENS = (val: string): boolean => {
    return val.endsWith('.eth') || val.endsWith('.xyz');
  };

  const resolveENS = useCallback(async (ensName: string): Promise<string | null> => {
    // In production, use actual ENS resolution
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    if (ensName.toLowerCase() === 'vitalik.eth') {
      return '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    }
    return `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  }, []);

  const validate = useCallback(async (inputValue: string) => {
    setError(null);
    setResolvedAddress(null);

    if (!inputValue) {
      setError('Recipient address is required');
      onValidate?.(false, 'Recipient address is required');
      return;
    }

    if (isAddress(inputValue)) {
      setResolvedAddress(inputValue);
      onValidate?.(true);
      return;
    }

    if (isENS(inputValue)) {
      setIsResolving(true);
      try {
        const resolved = await resolveENS(inputValue);
        if (resolved) {
          setResolvedAddress(resolved);
          onValidate?.(true);
        } else {
          setError('Could not resolve ENS name');
          onValidate?.(false, 'Could not resolve ENS name');
        }
      } catch (err) {
        setError('Failed to resolve ENS name');
        onValidate?.(false, 'Failed to resolve ENS name');
      } finally {
        setIsResolving(false);
      }
      return;
    }

    setError('Invalid address format');
    onValidate?.(false, 'Invalid address format');
  }, [resolveENS, onValidate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        validate(value);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, validate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue, resolvedAddress || undefined);
  }, [onChange, resolvedAddress]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div
        className={`relative rounded-xl border-2 transition-colors ${
          error && showValidation
            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
            : resolvedAddress
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
            : isFocused
            ? 'border-blue-500 bg-white dark:bg-gray-800'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center px-4 py-3">
          {/* Icon */}
          <div className="mr-3">
            {isResolving ? (
              <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : error && showValidation ? (
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : resolvedAddress ? (
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>

          {/* Input */}
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm"
          />

          {/* Clear Button */}
          {value && !disabled && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setResolvedAddress(null);
                setError(null);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Resolved Address Display */}
        {resolvedAddress && isENS(value) && (
          <div className="px-4 pb-3 -mt-1">
            <p className="text-sm text-green-600 dark:text-green-400 font-mono">
              → {formatAddress(resolvedAddress)}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && showValidation && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Resolving State */}
      {isResolving && (
        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
          Resolving ENS name...
        </p>
      )}
    </div>
  );
};

export default React.memo(RecipientInput);

