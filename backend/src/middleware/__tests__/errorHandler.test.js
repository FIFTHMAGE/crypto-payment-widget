import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import errorHandler from '../errorHandler.js'

describe('Error Handler Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
  })

  it('should handle generic errors', () => {
    const error = new Error('Test error')
    
    errorHandler(error, req, res, next)
    
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Test error',
      })
    )
  })

  it('should handle custom status codes', () => {
    const error = new Error('Not found')
    error.statusCode = 404
    
    errorHandler(error, req, res, next)
    
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should include stack trace in development', () => {
    process.env.NODE_ENV = 'development'
    const error = new Error('Dev error')
    
    errorHandler(error, req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      })
    )
  })

  it('should not include stack trace in production', () => {
    process.env.NODE_ENV = 'production'
    const error = new Error('Prod error')
    
    errorHandler(error, req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.not.objectContaining({
        stack: expect.any(String),
      })
    )
  })

  it('should handle validation errors', () => {
    const error = { isJoi: true, details: [{ message: 'Invalid input' }] }
    
    errorHandler(error, req, res, next)
    
    expect(res.status).toHaveBeenCalledWith(400)
  })
})

