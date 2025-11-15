export const APP_NAME = 'Crypto Payment Widget'
export const APP_VERSION = '1.0.0'

export const ROUTES = {
  HOME: '/',
  PAYMENTS: '/payments',
  TRANSACTIONS: '/transactions',
  WALLET: '/wallet',
  SETTINGS: '/settings',
  ANALYTICS: '/analytics',
} as const

export const LOCAL_STORAGE_KEYS = {
  API_KEY: 'api_key',
  WALLET_ADDRESS: 'wallet_address',
  THEME: 'theme',
  RECENT_ADDRESSES: 'recent_addresses',
  PAYMENT_TEMPLATES: 'payment_templates',
} as const

export const SESSION_STORAGE_KEYS = {
  PENDING_TX: 'pending_tx',
  ACTIVE_PAYMENT: 'active_payment',
} as const

export const QUERY_KEYS = {
  PAYMENTS: 'payments',
  PAYMENT: 'payment',
  TRANSACTIONS: 'transactions',
  TRANSACTION: 'transaction',
  WALLET_BALANCE: 'wallet-balance',
  TOKEN_BALANCES: 'token-balances',
  WALLET_STATS: 'wallet-stats',
} as const

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first.',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
  TRANSACTION_REJECTED: 'Transaction was rejected by user.',
  INVALID_ADDRESS: 'Invalid Ethereum address.',
  INVALID_AMOUNT: 'Invalid amount specified.',
  API_ERROR: 'API error occurred. Please try again.',
} as const

export const SUCCESS_MESSAGES = {
  PAYMENT_INITIATED: 'Payment initiated successfully!',
  TRANSACTION_CONFIRMED: 'Transaction confirmed!',
  WALLET_CONNECTED: 'Wallet connected successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
} as const

export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 150,
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGES_SHOWN: 5,
} as const

export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy HH:mm:ss',
  TIME_ONLY: 'HH:mm:ss',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const

export const REFRESH_INTERVALS = {
  BALANCE: 60000, // 1 minute
  TRANSACTIONS: 30000, // 30 seconds
  PENDING_TX: 5000, // 5 seconds
  PRICE: 120000, // 2 minutes
} as const

