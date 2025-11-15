import { config } from '../config/index.js'

// Simple in-memory rate limiter (in production, use Redis)
const requestCounts = new Map()

export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  const windowMs = config.rateLimit.windowMs
  const max = config.rateLimit.max

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, [])
  }

  const requests = requestCounts.get(ip)
  const recentRequests = requests.filter((timestamp) => now - timestamp < windowMs)

  if (recentRequests.length >= max) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
    })
  }

  recentRequests.push(now)
  requestCounts.set(ip, recentRequests)

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of requestCounts.entries()) {
      const filtered = value.filter((timestamp) => now - timestamp < windowMs)
      if (filtered.length === 0) {
        requestCounts.delete(key)
      } else {
        requestCounts.set(key, filtered)
      }
    }
  }

  next()
}

