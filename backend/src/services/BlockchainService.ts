/**
 * BlockchainService - Blockchain interaction service
 * @module services
 */

import { ethers } from 'ethers';
import { Logger } from '../utils/logger';

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  confirmations?: number;
}

export interface TransactionReceipt {
  hash: string;
  from: string;
  to: string;
  blockNumber: number;
  gasUsed: string;
  status: boolean;
  timestamp: number;
}

export class BlockchainService {
  private logger: Logger;
  private provider: ethers.JsonRpcProvider;
  private chainId: number;
  private requiredConfirmations: number;

  constructor(config: BlockchainConfig) {
    this.logger = new Logger('BlockchainService');
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.chainId = config.chainId;
    this.requiredConfirmations = config.confirmations || 3;
    this.logger.info(`BlockchainService initialized for chain ${config.chainId}`);
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) return null;

      const block = await this.provider.getBlock(receipt.blockNumber);
      if (!block) return null;

      return {
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to || '',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1,
        timestamp: block.timestamp,
      };
    } catch (error: any) {
      this.logger.error(`Error getting transaction receipt for ${txHash}:`, error);
      return null;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string): Promise<TransactionReceipt> {
    try {
      this.logger.info(`Waiting for transaction ${txHash} to be confirmed`);
      const receipt = await this.provider.waitForTransaction(txHash, this.requiredConfirmations);
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      const block = await this.provider.getBlock(receipt.blockNumber);
      if (!block) {
        throw new Error('Block not found');
      }

      return {
        hash: receipt.hash,
        from: receipt.from,
        to: receipt.to || '',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1,
        timestamp: block.timestamp,
      };
    } catch (error: any) {
      this.logger.error(`Error waiting for transaction ${txHash}:`, error);
      throw error;
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error: any) {
      this.logger.error('Error getting block number:', error);
      throw error;
    }
  }

  /**
   * Get balance
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      this.logger.error(`Error getting balance for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const tokenAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];
      const contract = new ethers.Contract(tokenAddress, tokenAbi, this.provider);
      const [balance, decimals] = await Promise.all([
        contract.balanceOf(userAddress),
        contract.decimals(),
      ]);
      return ethers.formatUnits(balance, decimals);
    } catch (error: any) {
      this.logger.error(`Error getting token balance for ${userAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    } catch (error: any) {
      this.logger.error('Error getting gas price:', error);
      throw error;
    }
  }

  /**
   * Estimate gas
   */
  async estimateGas(transaction: ethers.TransactionRequest): Promise<string> {
    try {
      const estimate = await this.provider.estimateGas(transaction);
      return estimate.toString();
    } catch (error: any) {
      this.logger.error('Error estimating gas:', error);
      throw error;
    }
  }

  /**
   * Check if address is contract
   */
  async isContract(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch (error: any) {
      this.logger.error(`Error checking if ${address} is contract:`, error);
      return false;
    }
  }

  /**
   * Get chain ID
   */
  getChainId(): number {
    return this.chainId;
  }

  /**
   * Get provider
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }
}

