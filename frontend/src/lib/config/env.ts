interface EnvConfig {
  walletConnectProjectId: string
  apiUrl: string
  contractAddress: string
  isDevelopment: boolean
  isProduction: boolean
}

function getEnvVar(key: string, defaultValue = ''): string {
  return import.meta.env[key] || defaultValue
}

export const env: EnvConfig = {
  walletConnectProjectId: getEnvVar('VITE_WALLETCONNECT_PROJECT_ID'),
  apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:5000'),
  contractAddress: getEnvVar('VITE_CONTRACT_ADDRESS'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}

export function validateEnv(): void {
  if (!env.walletConnectProjectId || env.walletConnectProjectId === 'your-project-id-here') {
    console.warn('⚠️ VITE_WALLETCONNECT_PROJECT_ID is not configured properly')
  }
}

// Run validation on import
validateEnv()

