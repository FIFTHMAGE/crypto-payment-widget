/**
 * Fee Calculation Utilities
 * Functions for calculating payment fees
 */

export interface FeeConfig {
  baseFeePercent: number;
  networkFee: number;
  minFee: number;
  maxFee: number;
  discountTiers?: FeeDiscountTier[];
}

export interface FeeDiscountTier {
  minVolume: number;
  discountPercent: number;
}

export interface FeeBreakdown {
  baseFee: number;
  networkFee: number;
  discount: number;
  totalFee: number;
  effectiveRate: number;
  netAmount: number;
}

// Default fee configuration
const DEFAULT_CONFIG: FeeConfig = {
  baseFeePercent: 0.3,
  networkFee: 0.001,
  minFee: 0.0001,
  maxFee: 100,
  discountTiers: [
    { minVolume: 10000, discountPercent: 10 },
    { minVolume: 50000, discountPercent: 20 },
    { minVolume: 100000, discountPercent: 30 },
  ],
};

/**
 * Calculate base fee
 */
export function calculateBaseFee(amount: number, feePercent: number): number {
  return amount * (feePercent / 100);
}

/**
 * Get applicable discount
 */
export function getVolumeDiscount(
  monthlyVolume: number,
  tiers: FeeDiscountTier[] = DEFAULT_CONFIG.discountTiers || []
): number {
  let discount = 0;
  
  for (const tier of tiers.sort((a, b) => b.minVolume - a.minVolume)) {
    if (monthlyVolume >= tier.minVolume) {
      discount = tier.discountPercent;
      break;
    }
  }
  
  return discount;
}

/**
 * Calculate complete fee breakdown
 */
export function calculateFeeBreakdown(
  amount: number,
  config: Partial<FeeConfig> = {},
  monthlyVolume: number = 0
): FeeBreakdown {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Calculate base fee
  let baseFee = calculateBaseFee(amount, fullConfig.baseFeePercent);
  
  // Apply min/max
  baseFee = Math.max(fullConfig.minFee, Math.min(fullConfig.maxFee, baseFee));
  
  // Get discount
  const discountPercent = getVolumeDiscount(monthlyVolume, fullConfig.discountTiers);
  const discount = baseFee * (discountPercent / 100);
  
  // Network fee
  const networkFee = fullConfig.networkFee;
  
  // Total fee
  const totalFee = baseFee - discount + networkFee;
  
  // Effective rate
  const effectiveRate = (totalFee / amount) * 100;
  
  // Net amount
  const netAmount = amount - totalFee;
  
  return {
    baseFee: Math.round(baseFee * 1000000) / 1000000,
    networkFee,
    discount: Math.round(discount * 1000000) / 1000000,
    totalFee: Math.round(totalFee * 1000000) / 1000000,
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
    netAmount: Math.round(netAmount * 1000000) / 1000000,
  };
}

/**
 * Estimate total with fees
 */
export function estimateTotalWithFees(
  amount: number,
  config: Partial<FeeConfig> = {}
): number {
  const breakdown = calculateFeeBreakdown(amount, config);
  return amount + breakdown.totalFee;
}

/**
 * Calculate amount from total including fees
 */
export function calculateAmountFromTotal(
  totalWithFees: number,
  config: Partial<FeeConfig> = {}
): number {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Reverse calculation: amount = (total - networkFee) / (1 + feePercent/100)
  const amount = (totalWithFees - fullConfig.networkFee) / (1 + fullConfig.baseFeePercent / 100);
  
  return Math.round(amount * 1000000) / 1000000;
}

/**
 * Format fee for display
 */
export function formatFee(fee: number, currency: string = 'ETH', decimals: number = 6): string {
  return `${fee.toFixed(decimals)} ${currency}`;
}

/**
 * Format fee as percentage
 */
export function formatFeePercent(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

/**
 * Get fee tier label
 */
export function getFeeTierLabel(monthlyVolume: number): string {
  if (monthlyVolume >= 100000) return 'Enterprise';
  if (monthlyVolume >= 50000) return 'Business';
  if (monthlyVolume >= 10000) return 'Growth';
  return 'Standard';
}

/**
 * Calculate savings at higher tier
 */
export function calculateTierSavings(
  monthlyPayments: number,
  averagePayment: number,
  currentTier: number,
  targetTier: number
): number {
  const currentDiscount = currentTier;
  const targetDiscount = targetTier;
  
  const currentFees = monthlyPayments * averagePayment * (DEFAULT_CONFIG.baseFeePercent / 100) * (1 - currentDiscount / 100);
  const targetFees = monthlyPayments * averagePayment * (DEFAULT_CONFIG.baseFeePercent / 100) * (1 - targetDiscount / 100);
  
  return currentFees - targetFees;
}

export { DEFAULT_CONFIG };

