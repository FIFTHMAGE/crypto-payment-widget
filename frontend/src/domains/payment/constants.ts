export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const DEFAULT_GAS_LIMIT = 21000;
export const DEFAULT_PLATFORM_FEE = 0.0025; // 0.25%
