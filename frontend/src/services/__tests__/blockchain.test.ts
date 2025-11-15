import { describe, it, expect, vi } from 'vitest'
import { getBlockNumber, getGasPrice, estimateGas, waitForTransaction } from '../blockchain'

// Mock viem
vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({
    getBlockNumber: vi.fn(async () => 12345678n),
    getGasPrice: vi.fn(async () => 20000000000n),
    estimateGas: vi.fn(async () => 21000n),
    waitForTransactionReceipt: vi.fn(async () => ({
      status: 'success',
      transactionHash: '0x123',
    })),
  })),
  http: vi.fn(),
}))

describe('Blockchain Service', () => {
  describe('getBlockNumber', () => {
    it('should get current block number', async () => {
      const blockNumber = await getBlockNumber(1)
      expect(blockNumber).toBeGreaterThan(0)
    })
  })

  describe('getGasPrice', () => {
    it('should get current gas price', async () => {
      const gasPrice = await getGasPrice(1)
      expect(gasPrice).toBeGreaterThan(0)
    })
  })

  describe('estimateGas', () => {
    it('should estimate transaction gas', async () => {
      const gas = await estimateGas({
        from: '0xabc',
        to: '0xdef',
        value: '0.01',
      })
      expect(gas).toBeGreaterThan(0)
    })
  })

  describe('waitForTransaction', () => {
    it('should wait for transaction confirmation', async () => {
      const receipt = await waitForTransaction('0x123', 1)
      expect(receipt.status).toBe('success')
    })
  })
})
