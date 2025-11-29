/**
 * useTokenPrices Hook
 * Fetch and manage real-time token prices
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface TokenPrice {
  symbol: string;
  address: string;
  priceUSD: number;
  change24h: number;
  volume24h: number;
  lastUpdated: Date;
}

export interface UseTokenPricesOptions {
  tokens: string[];
  refreshInterval?: number;
  fiatCurrency?: string;
}

export interface UseTokenPricesReturn {
  prices: Map<string, TokenPrice>;
  isLoading: boolean;
  error: Error | null;
  getPrice: (symbol: string) => TokenPrice | null;
  convert: (amount: number, from: string, to: string) => number | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds

export function useTokenPrices(options: UseTokenPricesOptions): UseTokenPricesReturn {
  const { tokens, refreshInterval = DEFAULT_REFRESH_INTERVAL, fiatCurrency = 'USD' } = options;
  
  const [prices, setPrices] = useState<Map<string, TokenPrice>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrices = useCallback(async () => {
    if (tokens.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // In production, call actual price API (CoinGecko, etc.)
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockPrices: Record<string, number> = {
        ETH: 2350 + Math.random() * 100,
        BTC: 43500 + Math.random() * 1000,
        USDC: 1.0,
        USDT: 1.0,
        DAI: 1.0,
        MATIC: 0.85 + Math.random() * 0.1,
      };

      const newPrices = new Map<string, TokenPrice>();
      const now = new Date();

      for (const token of tokens) {
        const basePrice = mockPrices[token.toUpperCase()] || 1;
        newPrices.set(token.toUpperCase(), {
          symbol: token.toUpperCase(),
          address: `0x${token}...`,
          priceUSD: basePrice,
          change24h: (Math.random() - 0.5) * 10,
          volume24h: Math.random() * 1000000000,
          lastUpdated: now,
        });
      }

      setPrices(newPrices);
      setLastUpdated(now);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch prices'));
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  const getPrice = useCallback((symbol: string): TokenPrice | null => {
    return prices.get(symbol.toUpperCase()) || null;
  }, [prices]);

  const convert = useCallback((amount: number, from: string, to: string): number | null => {
    const fromPrice = getPrice(from);
    const toPrice = getPrice(to);

    if (!fromPrice || !toPrice) return null;
    if (toPrice.priceUSD === 0) return null;

    const valueUSD = amount * fromPrice.priceUSD;
    return valueUSD / toPrice.priceUSD;
  }, [getPrice]);

  const refresh = useCallback(async () => {
    await fetchPrices();
  }, [fetchPrices]);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchPrices, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrices, refreshInterval]);

  return {
    prices,
    isLoading,
    error,
    getPrice,
    convert,
    refresh,
    lastUpdated,
  };
}

export default useTokenPrices;

