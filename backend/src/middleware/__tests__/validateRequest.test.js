import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import { validateRequest } from '../validateRequest.js'
import Joi from 'joi'

describe('Validate Request Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
  })

  it('should pass validation with valid data', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
    })
    
    req.body = { name: 'Test' }
    
    const middleware = validateRequest(schema)
    middleware(req, res, next)
    
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should fail validation with invalid data', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
    })
    
    req.body = {}
    
    const middleware = validateRequest(schema)
    middleware(req, res, next)
    
    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).not.toHaveBeenCalled()
  })

  it('should validate query parameters', () => {
    const schema = Joi.object({
      page: Joi.number().required(),
    })
    
    req.query = { page: '1' }
    
    const middleware = validateRequest(schema, 'query')
    middleware(req, res, next)
    
    expect(next).toHaveBeenCalled()
  })

  it('should return detailed error messages', () => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    })
    
    req.body = { email: 'invalid' }
    
    const middleware = validateRequest(schema)
    middleware(req, res, next)
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('email'),
      })
    )
  })
})

