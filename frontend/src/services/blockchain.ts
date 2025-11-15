import type { Address } from 'viem'
import { CHAIN_EXPLORER_URLS, CHAIN_NAMES } from '../lib/constants'

export class BlockchainService {
  getExplorerUrl(chainId: number): string {
    return CHAIN_EXPLORER_URLS[chainId] || 'https://etherscan.io'
  }

  getTransactionUrl(txHash: string, chainId: number): string {
    return `${this.getExplorerUrl(chainId)}/tx/${txHash}`
  }

  getAddressUrl(address: Address, chainId: number): string {
    return `${this.getExplorerUrl(chainId)}/address/${address}`
  }

  getChainName(chainId: number): string {
    return CHAIN_NAMES[chainId] || `Chain ${chainId}`
  }

  isTestnet(chainId: number): boolean {
    const testnets = [11155111, 5, 80001, 84531, 421613]
    return testnets.includes(chainId)
  }
}

export const blockchainService = new BlockchainService()

