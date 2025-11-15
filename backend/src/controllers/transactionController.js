import { transactionService } from '../services/transactionService.js'
import { AppError } from '../middleware/errorHandler.js'
import { validateTransaction } from '../validators/transactionValidator.js'

export const createTransaction = async (req, res, next) => {
  try {
    const validation = validateTransaction(req.body)
    if (!validation.valid) {
      throw new AppError(validation.error, 400)
    }

    const transaction = await transactionService.create(req.body)
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction logged successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getTransactions = async (req, res, next) => {
  try {
    const { limit, offset } = req.query
    const result = await transactionService.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const getTransactionByHash = async (req, res, next) => {
  try {
    const { txHash } = req.params
    const transaction = await transactionService.findByHash(txHash)

    if (!transaction) {
      throw new AppError('Transaction not found', 404)
    }

    res.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    next(error)
  }
}

export const verifyTransaction = async (req, res, next) => {
  try {
    const { txHash } = req.params
    
    // Mock verification - in production, verify on-chain
    const transaction = await transactionService.update(txHash, {
      status: 'confirmed',
      verifiedAt: new Date().toISOString(),
    })

    if (!transaction) {
      throw new AppError('Transaction not found', 404)
    }

    res.json({
      success: true,
      data: transaction,
      verified: true,
    })
  } catch (error) {
    next(error)
  }
}

export const getTransactionStats = async (req, res, next) => {
  try {
    const stats = await transactionService.getStats()
    
    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}

