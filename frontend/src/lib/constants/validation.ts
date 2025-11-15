export const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export const TRANSACTION_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/

export const MIN_PAYMENT_AMOUNT = '0.000001'

export const MAX_PAYMENT_AMOUNT = '1000000'

export const VALIDATION_MESSAGES = {
  INVALID_ADDRESS: 'Invalid Ethereum address',
  INVALID_AMOUNT: 'Invalid amount',
  AMOUNT_TOO_LOW: `Amount must be at least ${MIN_PAYMENT_AMOUNT}`,
  AMOUNT_TOO_HIGH: `Amount cannot exceed ${MAX_PAYMENT_AMOUNT}`,
  REQUIRED_FIELD: 'This field is required',
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
} as const

