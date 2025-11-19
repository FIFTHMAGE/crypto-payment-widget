export const TX_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  CONFIRMING: 'confirming',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export const CONFIRMATION_BLOCKS = 3;
export const TX_TIMEOUT = 60000; // 60 seconds
