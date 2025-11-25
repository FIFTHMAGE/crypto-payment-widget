import express from 'express'

import analyticsRoutes from './analyticsRoutes.js'
import healthRoutes from './healthRoutes.js'
import systemRoutes from './systemRoutes.js'
import transactionRoutes from './transactionRoutes.js'
import webhookRoutes from './webhookRoutes.js'

const router = express.Router()

// API v1 routes
router.use('/health', healthRoutes)
router.use('/v1/transactions', transactionRoutes)
router.use('/v1/analytics', analyticsRoutes)
router.use('/v1/webhooks', webhookRoutes)
router.use('/v1/system', systemRoutes)

export default router

