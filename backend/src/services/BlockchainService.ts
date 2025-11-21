/**
 * Blockchain service - Interact with blockchain networks
 * @module services
 */

import { ethers } from 'ethers';
import { Logger } from '../utils/logger';
import { env } from '../config/environment';

export class BlockchainService {
  private logger: Logger;
  private providers: Map<string, ethers.JsonRpcProvider>;

  constructor() {
    this.logger = new Logger('BlockchainService');
    this.providers = new Map();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const networks = [
      { name: 'ethereum', rpcUrl: env.ETHEREUM_RPC_URL },
      { name: 'polygon', rpcUrl: env.POLYGON_RPC_URL },
      { name: 'bsc', rpcUrl: env.BSC_RPC_URL },
    ];

    networks.forEach(({ name, rpcUrl }) => {
      if (rpcUrl) {
        this.providers.set(name, new ethers.JsonRpcProvider(rpcUrl));
        this.logger.info(`Initialized ${name} provider`);
      }
    });
  }

  public getProvider(network: string): ethers.JsonRpcProvider {
    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not found for network: ${network}`);
    }
    return provider;
  }

  public async getBalance(network: string, address: string): Promise<string> {
    const provider = this.getProvider(network);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  public async getTransaction(network: string, txHash: string): Promise<ethers.TransactionResponse | null> {
    const provider = this.getProvider(network);
    return await provider.getTransaction(txHash);
  }

  public async getTransactionReceipt(
    network: string,
    txHash: string
  ): Promise<ethers.TransactionReceipt | null> {
    const provider = this.getProvider(network);
    return await provider.getTransactionReceipt(txHash);
  }

  public async waitForTransaction(network: string, txHash: string, confirmations: number = 1): Promise<void> {
    const provider = this.getProvider(network);
    const receipt = await provider.waitForTransaction(txHash, confirmations);

    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }

    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }
  }

  public async getCurrentBlock(network: string): Promise<number> {
    const provider = this.getProvider(network);
    return await provider.getBlockNumber();
  }

  public async estimateGas(network: string, tx: ethers.TransactionRequest): Promise<bigint> {
    const provider = this.getProvider(network);
    return await provider.estimateGas(tx);
  }

  public async getGasPrice(network: string): Promise<bigint> {
    const provider = this.getProvider(network);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice || 0n;
  }
}

export const blockchainService = new BlockchainService();
