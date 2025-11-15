import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import securityHeaders from '../securityHeaders.js'

describe('Security Headers Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {
      setHeader: vi.fn(),
    }
    next = vi.fn()
  })

  it('should set security headers', () => {
    securityHeaders(req, res, next)
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff'
    )
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Frame-Options',
      'DENY'
    )
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-XSS-Protection',
      '1; mode=block'
    )
    expect(next).toHaveBeenCalled()
  })

  it('should set HSTS header', () => {
    securityHeaders(req, res, next)
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      expect.stringContaining('max-age')
    )
  })

  it('should set CSP header', () => {
    securityHeaders(req, res, next)
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.any(String)
    )
  })
})

