import express from 'express'
import {
  createTransaction,
  getTransactions,
  getTransactionByHash,
  verifyTransaction,
  getTransactionStats,
} from '../controllers/transactionController.js'

const router = express.Router()

router.post('/', createTransaction)
router.get('/', getTransactions)
router.get('/stats', getTransactionStats)
router.get('/:txHash', getTransactionByHash)
router.post('/:txHash/verify', verifyTransaction)

export default router

