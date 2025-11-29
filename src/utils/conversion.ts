/**
 * Currency Conversion Utilities
 * Handle currency conversions and formatting
 */

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

export interface ConversionResult {
  amount: number;
  from: string;
  to: string;
  rate: number;
  fee?: number;
  total: number;
}

// Common cryptocurrency decimals
const TOKEN_DECIMALS: Record<string, number> = {
  ETH: 18,
  WETH: 18,
  BTC: 8,
  WBTC: 8,
  USDC: 6,
  USDT: 6,
  DAI: 18,
  MATIC: 18,
  BNB: 18,
};

// Cache for exchange rates
const rateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

/**
 * Convert amount between currencies
 */
export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rate: number
): ConversionResult {
  const converted = amount * rate;
  
  return {
    amount,
    from: fromCurrency,
    to: toCurrency,
    rate,
    total: converted,
  };
}

/**
 * Convert with fee calculation
 */
export function convertWithFee(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  feePercent: number = 0
): ConversionResult {
  const fee = amount * (feePercent / 100);
  const netAmount = amount - fee;
  const converted = netAmount * rate;
  
  return {
    amount,
    from: fromCurrency,
    to: toCurrency,
    rate,
    fee,
    total: converted,
  };
}

/**
 * Format currency amount for display
 */
export function formatCurrency(
  amount: number,
  currency: string,
  options: {
    maxDecimals?: number;
    minDecimals?: number;
    showSymbol?: boolean;
  } = {}
): string {
  const { maxDecimals = 6, minDecimals = 2, showSymbol = true } = options;
  
  const decimals = Math.min(
    maxDecimals,
    Math.max(minDecimals, getSignificantDecimals(amount))
  );

  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${formatted} ${currency}` : formatted;
}

/**
 * Format USD amount
 */
export function formatUSD(amount: number, showCents: boolean = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

/**
 * Format crypto amount with appropriate precision
 */
export function formatCrypto(
  amount: number | string,
  symbol: string,
  showSymbol: boolean = true
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return showSymbol ? `0 ${symbol}` : '0';

  let formatted: string;
  
  if (num === 0) {
    formatted = '0';
  } else if (Math.abs(num) < 0.000001) {
    formatted = num.toExponential(2);
  } else if (Math.abs(num) < 0.01) {
    formatted = num.toFixed(6);
  } else if (Math.abs(num) < 1) {
    formatted = num.toFixed(4);
  } else if (Math.abs(num) < 1000) {
    formatted = num.toFixed(4);
  } else {
    formatted = num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  return showSymbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Convert wei to ether
 */
export function weiToEther(wei: bigint | string): number {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  return Number(weiValue) / 1e18;
}

/**
 * Convert ether to wei
 */
export function etherToWei(ether: number | string): bigint {
  const etherValue = typeof ether === 'string' ? parseFloat(ether) : ether;
  return BigInt(Math.floor(etherValue * 1e18));
}

/**
 * Convert token amount from raw to display
 */
export function fromTokenDecimals(
  amount: bigint | string,
  decimals: number
): number {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  return Number(value) / Math.pow(10, decimals);
}

/**
 * Convert token amount from display to raw
 */
export function toTokenDecimals(
  amount: number | string,
  decimals: number
): bigint {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.floor(value * Math.pow(10, decimals)));
}

/**
 * Get token decimals
 */
export function getTokenDecimals(symbol: string): number {
  return TOKEN_DECIMALS[symbol.toUpperCase()] ?? 18;
}

/**
 * Parse amount string with validation
 */
export function parseAmount(
  input: string,
  decimals: number = 18
): { valid: boolean; value: number; raw: bigint } {
  // Remove commas and whitespace
  const cleaned = input.replace(/[,\s]/g, '');
  
  // Validate format
  if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === '' || cleaned === '.') {
    return { valid: false, value: 0, raw: BigInt(0) };
  }

  const value = parseFloat(cleaned);
  
  if (isNaN(value) || value < 0) {
    return { valid: false, value: 0, raw: BigInt(0) };
  }

  // Check decimal places
  const parts = cleaned.split('.');
  if (parts[1] && parts[1].length > decimals) {
    return { valid: false, value: 0, raw: BigInt(0) };
  }

  const raw = toTokenDecimals(value, decimals);

  return { valid: true, value, raw };
}

/**
 * Calculate inverse rate
 */
export function inverseRate(rate: number): number {
  if (rate === 0) return 0;
  return 1 / rate;
}

/**
 * Calculate percentage change
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Get significant decimal places
 */
function getSignificantDecimals(value: number): number {
  if (value === 0) return 2;
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1000) return 2;
  if (absValue >= 1) return 4;
  if (absValue >= 0.01) return 4;
  if (absValue >= 0.0001) return 6;
  return 8;
}

/**
 * Calculate average rate from multiple quotes
 */
export function averageRate(rates: number[]): number {
  if (rates.length === 0) return 0;
  return rates.reduce((sum, r) => sum + r, 0) / rates.length;
}

/**
 * Get rate from cache or fetch new
 */
export async function getCachedRate(
  from: string,
  to: string,
  fetchFn: () => Promise<number>
): Promise<number> {
  const key = `${from}-${to}`;
  const cached = rateCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.rate;
  }

  const rate = await fetchFn();
  rateCache.set(key, { rate, timestamp: Date.now() });
  return rate;
}

/**
 * Clear rate cache
 */
export function clearRateCache(): void {
  rateCache.clear();
}

