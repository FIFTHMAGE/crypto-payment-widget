import { logger } from '../utils/logger.js'

class TransactionService {
  constructor() {
    // In production, replace with database
    this.transactions = []
  }

  async create(transactionData) {
    const transaction = {
      id: this.transactions.length + 1,
      ...transactionData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.transactions.push(transaction)
    logger.info('Transaction created', { id: transaction.id })
    
    return transaction
  }

  async findAll({ limit = 50, offset = 0 } = {}) {
    const total = this.transactions.length
    const items = this.transactions
      .slice(offset, offset + limit)
      .reverse()

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    }
  }

  async findByHash(txHash) {
    return this.transactions.find((tx) => tx.txHash === txHash)
  }

  async update(txHash, updates) {
    const index = this.transactions.findIndex((tx) => tx.txHash === txHash)
    
    if (index === -1) {
      return null
    }

    this.transactions[index] = {
      ...this.transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    logger.info('Transaction updated', { txHash })
    return this.transactions[index]
  }

  async delete(txHash) {
    const index = this.transactions.findIndex((tx) => tx.txHash === txHash)
    
    if (index === -1) {
      return false
    }

    this.transactions.splice(index, 1)
    logger.info('Transaction deleted', { txHash })
    return true
  }

  async getStats() {
    return {
      total: this.transactions.length,
      pending: this.transactions.filter((tx) => tx.status === 'pending').length,
      confirmed: this.transactions.filter((tx) => tx.status === 'confirmed').length,
      failed: this.transactions.filter((tx) => tx.status === 'failed').length,
    }
  }
}

export const transactionService = new TransactionService()

