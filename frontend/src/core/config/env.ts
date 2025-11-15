interface EnvironmentConfig {
  // App
  appName: string
  appVersion: string
  environment: 'development' | 'staging' | 'production'
  isDevelopment: boolean
  isProduction: boolean

  // API
  apiBaseUrl: string
  apiTimeout: number

  // Blockchain
  walletConnectProjectId: string
  defaultChainId: number
  supportedChainIds: number[]

  // Contract addresses
  paymentProcessorAddress: string
  escrowContractAddress: string

  // Features
  features: {
    enableAnalytics: boolean
    enableWebhooks: boolean
    enableRecurringPayments: boolean
    enableTemplates: boolean
  }

  // Limits
  maxPaymentAmount: string
  minPaymentAmount: string
  defaultPageSize: number
}

const getEnvVar = (key: string, defaultValue = ''): string => {
  return import.meta.env[key] || defaultValue
}

const getBoolEnvVar = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key]
  return value ? parseInt(value, 10) : defaultValue
}

const environment = getEnvVar('VITE_ENVIRONMENT', 'development') as
  | 'development'
  | 'staging'
  | 'production'

export const config: EnvironmentConfig = {
  // App
  appName: getEnvVar('VITE_APP_NAME', 'Crypto Payment Widget'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  environment,
  isDevelopment: environment === 'development',
  isProduction: environment === 'production',

  // API
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', 30000),

  // Blockchain
  walletConnectProjectId: getEnvVar('VITE_WALLET_CONNECT_PROJECT_ID', ''),
  defaultChainId: getNumberEnvVar('VITE_DEFAULT_CHAIN_ID', 1),
  supportedChainIds: getEnvVar('VITE_SUPPORTED_CHAIN_IDS', '1,5,11155111')
    .split(',')
    .map(Number),

  // Contract addresses
  paymentProcessorAddress: getEnvVar(
    'VITE_PAYMENT_PROCESSOR_ADDRESS',
    '0x0000000000000000000000000000000000000000'
  ),
  escrowContractAddress: getEnvVar(
    'VITE_ESCROW_CONTRACT_ADDRESS',
    '0x0000000000000000000000000000000000000000'
  ),

  // Features
  features: {
    enableAnalytics: getBoolEnvVar('VITE_ENABLE_ANALYTICS', true),
    enableWebhooks: getBoolEnvVar('VITE_ENABLE_WEBHOOKS', true),
    enableRecurringPayments: getBoolEnvVar(
      'VITE_ENABLE_RECURRING_PAYMENTS',
      true
    ),
    enableTemplates: getBoolEnvVar('VITE_ENABLE_TEMPLATES', true),
  },

  // Limits
  maxPaymentAmount: getEnvVar('VITE_MAX_PAYMENT_AMOUNT', '1000'),
  minPaymentAmount: getEnvVar('VITE_MIN_PAYMENT_AMOUNT', '0.001'),
  defaultPageSize: getNumberEnvVar('VITE_DEFAULT_PAGE_SIZE', 10),
}

// Validate critical configuration
if (!config.walletConnectProjectId && config.isProduction) {
  console.error('Missing required env var: VITE_WALLET_CONNECT_PROJECT_ID')
}

if (config.apiBaseUrl.includes('localhost') && config.isProduction) {
  console.warn('Using localhost API in production environment')
}

