import type { Address } from 'viem'
import { parseEther } from 'viem'
import type { PaymentRequest, SplitPaymentRequest } from '../lib/types'
import { ZERO_ADDRESS } from '../lib/constants'

export class ContractService {
  preparePaymentArgs(request: PaymentRequest) {
    const { amount, recipient, metadata = '', token = ZERO_ADDRESS } = request

    return {
      payee: recipient,
      token,
      amount: parseEther(amount),
      metadata,
    }
  }

  prepareSplitPaymentArgs(request: SplitPaymentRequest) {
    const { recipients, amounts, metadata = '', token = ZERO_ADDRESS } = request

    const parsedAmounts = amounts.map((a) => parseEther(a))
    const totalValue = parsedAmounts.reduce((sum, val) => sum + val, 0n)

    return {
      recipients,
      amounts: parsedAmounts,
      token,
      metadata,
      totalValue,
    }
  }

  prepareEscrowArgs(
    payee: Address,
    amount: string,
    releaseTime: number,
    metadata = '',
    token: Address = ZERO_ADDRESS
  ) {
    return {
      payee,
      token,
      amount: parseEther(amount),
      releaseTime,
      metadata,
    }
  }

  calculatePlatformFee(amount: bigint, feePercentage = 0.25): bigint {
    // Convert percentage to basis points (0.25% = 25 basis points)
    const basisPoints = BigInt(Math.floor(feePercentage * 100))
    return (amount * basisPoints) / 10000n
  }

  calculateNetAmount(amount: bigint, feePercentage = 0.25): bigint {
    const fee = this.calculatePlatformFee(amount, feePercentage)
    return amount - fee
  }
}

export const contractService = new ContractService()

