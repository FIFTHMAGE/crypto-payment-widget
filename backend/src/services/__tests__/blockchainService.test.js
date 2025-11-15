import { describe, it, expect, vi } from '@jest/globals'
import { getBlockNumber, getGasPrice, verifyTransaction } from '../blockchainService.js'

describe('Blockchain Service', () => {
  it('should get block number', async () => {
    const blockNumber = await getBlockNumber()
    expect(blockNumber).toBeGreaterThan(0)
  })

  it('should get gas price', async () => {
    const gasPrice = await getGasPrice()
    expect(gasPrice).toBeDefined()
  })

  it('should verify transaction on blockchain', async () => {
    const result = await verifyTransaction('0x123')
    expect(result).toBeDefined()
  })
})

