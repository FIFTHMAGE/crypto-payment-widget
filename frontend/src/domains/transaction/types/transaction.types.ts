export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  CONTRACT_INTERACTION = 'contract',
  APPROVAL = 'approval',
  SWAP = 'swap',
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  token?: string
  tokenSymbol?: string
  status: TransactionStatus | string
  type: TransactionType | string
  timestamp: number
  blockNumber?: number
  confirmations?: number
  gasUsed?: string
  gasPrice?: string
  nonce?: number
  data?: string
}

export interface TransactionReceipt {
  transactionHash: string
  blockNumber: number
  blockHash: string
  from: string
  to: string
  gasUsed: string
  cumulativeGasUsed: string
  effectiveGasPrice: string
  status: boolean
  logs: TransactionLog[]
  contractAddress?: string
}

export interface TransactionLog {
  address: string
  topics: string[]
  data: string
  blockNumber: number
  transactionHash: string
  logIndex: number
  removed: boolean
}

export interface TransactionListParams {
  address?: string
  limit?: number
  offset?: number
  status?: TransactionStatus
  type?: TransactionType
  startBlock?: number
  endBlock?: number
}

export interface TransactionSearchParams {
  query?: string
  address?: string
  startDate?: Date
  endDate?: Date
  minValue?: string
  maxValue?: string
  status?: TransactionStatus[]
  type?: TransactionType[]
}

export interface GasEstimate {
  gasLimit: string
  gasPrice: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  estimatedCost: string
  estimatedTime: number
}

export interface TransactionProgress {
  hash: string
  status: TransactionStatus
  confirmations: number
  requiredConfirmations: number
  progress: number // 0-100
}

export interface PendingTransaction {
  hash: string
  from: string
  to: string
  value: string
  nonce: number
  gasPrice: string
  submittedAt: number
  canCancel: boolean
  canSpeedUp: boolean
}

