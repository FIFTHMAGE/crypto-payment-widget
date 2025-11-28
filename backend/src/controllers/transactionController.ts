import { type NextFunction, type Request, type Response } from 'express';

import { AppError } from '../middleware/errorHandler';
import { transactionService } from '../services/transactionService';
import { validateTransaction } from '../validators/transactionValidator';

interface TransactionBody {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  chainId: number;
  status?: string;
}

interface TransactionParams {
  txHash: string;
}

interface TransactionQuery {
  limit?: string;
  offset?: string;
  status?: string;
  from?: string;
  to?: string;
}

interface TransactionResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  verified?: boolean;
}

/**
 * @route POST /api/v1/transactions
 * @desc Create a new transaction record
 */
export const createTransaction = async (
  req: Request<object, TransactionResponse, TransactionBody>,
  res: Response<TransactionResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = validateTransaction(req.body);
    if (!validation.valid) {
      throw new AppError(validation.error || 'Validation failed', 400);
    }

    const transaction = await transactionService.create(req.body);

    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction logged successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/transactions
 * @desc Get all transactions with pagination
 */
export const getTransactions = async (
  req: Request<object, TransactionResponse, object, TransactionQuery>,
  res: Response<TransactionResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = '10', offset = '0', status, from, to } = req.query;
    const result = await transactionService.findAll({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      status,
      from,
      to,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/transactions/:txHash
 * @desc Get a transaction by hash
 */
export const getTransactionByHash = async (
  req: Request<TransactionParams>,
  res: Response<TransactionResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { txHash } = req.params;
    const transaction = await transactionService.findByHash(txHash);

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/v1/transactions/:txHash/verify
 * @desc Verify a transaction on-chain
 */
export const verifyTransaction = async (
  req: Request<TransactionParams>,
  res: Response<TransactionResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { txHash } = req.params;

    const transaction = await transactionService.update(txHash, {
      status: 'confirmed',
      verifiedAt: new Date().toISOString(),
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    res.json({
      success: true,
      data: transaction,
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/transactions/stats
 * @desc Get transaction statistics
 */
export const getTransactionStats = async (
  _req: Request,
  res: Response<TransactionResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await transactionService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const transactionController = {
  createTransaction,
  getTransactions,
  getTransactionByHash,
  verifyTransaction,
  getTransactionStats,
};

export default transactionController;

