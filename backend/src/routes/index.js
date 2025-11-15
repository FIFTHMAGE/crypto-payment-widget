import express from 'express'
import transactionRoutes from './transactionRoutes.js'
import healthRoutes from './healthRoutes.js'

const router = express.Router()

// API v1 routes
router.use('/health', healthRoutes)
router.use('/v1/transactions', transactionRoutes)

export default router

