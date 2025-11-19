/**
 * Payment utility functions
 * @module domains/payment/utils
 */

import { parseEther, formatEther } from 'ethers';

/**
 * Convert ETH amount to Wei
 */
export function toWei(ethAmount: string): bigint {
  try {
    return parseEther(ethAmount);
  } catch (error) {
    throw new Error(`Invalid ETH amount: ${ethAmount}`);
  }
}

/**
 * Convert Wei to ETH amount
 */
export function fromWei(weiAmount: bigint): string {
  return formatEther(weiAmount);
}

/**
 * Calculate total with fee
 */
export function calculateTotalWithFee(
  amount: string,
  feePercentage: number
): string {
  const amountNum = parseFloat(amount);
  const fee = amountNum * (feePercentage / 100);
  return (amountNum + fee).toString();
}

/**
 * Validate payment amount
 */
export function isValidPaymentAmount(amount: string): boolean {
  try {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && isFinite(num);
  } catch {
    return false;
  }
}

