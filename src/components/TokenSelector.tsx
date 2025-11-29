/**
 * TokenSelector Component
 * Searchable token selection dropdown
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
  priceUSD?: number;
}

export interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  label?: string;
  placeholder?: string;
  showBalance?: boolean;
  showPrice?: boolean;
  disabled?: boolean;
  className?: string;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onSelect,
  label = 'Select token',
  placeholder = 'Search by name or address',
  showBalance = true,
  showPrice = true,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTokens = useMemo(() => {
    if (!search) return tokens;
    const searchLower = search.toLowerCase();
    return tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower) ||
        token.address.toLowerCase().includes(searchLower)
    );
  }, [tokens, search]);

  const handleSelect = useCallback((token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearch('');
  }, [onSelect]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [disabled]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* Selected Token Button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
        }`}
      >
        {selectedToken ? (
          <>
            {selectedToken.logoURI ? (
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                {selectedToken.symbol.slice(0, 2)}
              </div>
            )}
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 dark:text-white">{selectedToken.symbol}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedToken.name}</p>
            </div>
            {showBalance && selectedToken.balance && (
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatBalance(selectedToken.balance)}
                </p>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-400">Select a token</span>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.address}
                  type="button"
                  onClick={() => handleSelect(token)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedToken?.address === token.address
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  {token.logoURI ? (
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                      {token.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{token.symbol}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{token.name}</p>
                  </div>
                  <div className="text-right">
                    {showBalance && token.balance && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatBalance(token.balance)}
                      </p>
                    )}
                    {showPrice && token.priceUSD && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatPrice(token.priceUSD)}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TokenSelector);

