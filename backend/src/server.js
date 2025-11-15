import express from 'express'
import cors from 'cors'
import { config, corsOptions } from './config/index.js'
import { logger } from './utils/logger.js'
import {
  errorHandler,
  notFound,
  rateLimiter,
  securityHeaders,
  requestLogger,
} from './middleware/index.js'
import routes from './routes/index.js'

const app = express()

// Trust proxy for rate limiting
app.set('trust proxy', 1)

// Security middleware
app.use(securityHeaders)

// CORS configuration
app.use(cors(corsOptions))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging
app.use(requestLogger)

// Rate limiting
app.use(rateLimiter)

// API routes
app.use('/api', routes)

// 404 handler
app.use(notFound)

// Global error handler
app.use(errorHandler)

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`)
  logger.info(`Environment: ${config.nodeEnv}`)
  logger.info(`Health check: http://localhost:${config.port}/api/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
})

export default app
