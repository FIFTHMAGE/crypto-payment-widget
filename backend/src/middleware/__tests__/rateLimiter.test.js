import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import rateLimiter from '../rateLimiter.js'

describe('Rate Limiter Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      ip: '127.0.0.1',
      headers: {},
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    }
    next = vi.fn()
  })

  it('should allow requests under limit', () => {
    rateLimiter(req, res, next)
    
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should set rate limit headers', () => {
    rateLimiter(req, res, next)
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-RateLimit-Limit',
      expect.any(Number)
    )
  })

  it('should block requests over limit', async () => {
    // Make multiple requests to exceed limit
    for (let i = 0; i < 101; i++) {
      rateLimiter(req, res, next)
    }
    
    expect(res.status).toHaveBeenCalledWith(429)
  })

  it('should reset after time window', async () => {
    vi.useFakeTimers()
    
    rateLimiter(req, res, next)
    
    // Advance time past window
    vi.advanceTimersByTime(61000)
    
    rateLimiter(req, res, next)
    
    expect(next).toHaveBeenCalled()
    
    vi.useRealTimers()
  })
})

