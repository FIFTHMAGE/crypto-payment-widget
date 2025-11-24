/**
 * Formats a blockchain address for display (e.g., 0x123...abcd).
 * @param address - The full address string.
 * @returns Truncated address or empty string if invalid.
 */
export const formatAddress = (address: string) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Formats a raw token amount (wei) to a readable decimal string.
 * @param amount - The raw amount as string or number.
 * @param decimals - Token decimals (default 18).
 * @param precision - Number of decimal places to show (default 4).
 * @returns Formatted number string.
 */
export const formatAmount = (amount: string | number, decimals: number = 18, precision: number = 4) => {
  const num = parseFloat(amount.toString());
  if (isNaN(num)) return '0.0000';
  return (num / Math.pow(10, decimals)).toFixed(precision);
};

/**
 * Formats a UNIX timestamp to a localized date time string.
 * @param timestamp - UNIX timestamp in seconds.
 * @returns Localized date string.
 */
export const formatTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

