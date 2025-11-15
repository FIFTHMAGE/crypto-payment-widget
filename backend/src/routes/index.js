import express from 'express'
import transactionRoutes from './transactionRoutes.js'
import healthRoutes from './healthRoutes.js'
import analyticsRoutes from './analyticsRoutes.js'
import webhookRoutes from './webhookRoutes.js'

const router = express.Router()

// API v1 routes
router.use('/health', healthRoutes)
router.use('/v1/transactions', transactionRoutes)
router.use('/v1/analytics', analyticsRoutes)
router.use('/v1/webhooks', webhookRoutes)

export default router

