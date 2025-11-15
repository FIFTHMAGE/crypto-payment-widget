import { AppError } from './errorHandler.js'
import { logger } from '../utils/logger.js'

// Mock API keys storage (in production, use database)
const apiKeys = new Map()

export const generateApiKey = (userId) => {
  const key = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  apiKeys.set(key, {
    userId,
    createdAt: new Date().toISOString(),
    lastUsed: null,
  })
  return key
}

export const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    return next(new AppError('API key is required', 401))
  }

  const keyData = apiKeys.get(apiKey)
  
  if (!keyData) {
    logger.warn(`Invalid API key attempt: ${apiKey.substr(0, 10)}...`)
    return next(new AppError('Invalid API key', 401))
  }

  // Update last used
  keyData.lastUsed = new Date().toISOString()
  
  // Attach user info to request
  req.userId = keyData.userId
  req.apiKey = apiKey

  next()
}

export const optionalApiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key']

  if (apiKey) {
    const keyData = apiKeys.get(apiKey)
    if (keyData) {
      req.userId = keyData.userId
      req.apiKey = apiKey
      keyData.lastUsed = new Date().toISOString()
    }
  }

  next()
}

