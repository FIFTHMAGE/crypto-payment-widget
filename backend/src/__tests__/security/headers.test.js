import { describe, it, expect, beforeAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import securityHeaders from '../../middleware/securityHeaders.js'

describe('Security Headers Tests', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(securityHeaders)
    app.get('/test', (req, res) => res.json({ ok: true }))
  })

  it('should set X-Content-Type-Options', async () => {
    const response = await request(app).get('/test')

    expect(response.headers['x-content-type-options']).toBe('nosniff')
  })

  it('should set X-Frame-Options', async () => {
    const response = await request(app).get('/test')

    expect(response.headers['x-frame-options']).toBe('DENY')
  })

  it('should set X-XSS-Protection', async () => {
    const response = await request(app).get('/test')

    expect(response.headers['x-xss-protection']).toBeDefined()
  })

  it('should set Strict-Transport-Security', async () => {
    const response = await request(app).get('/test')

    expect(response.headers['strict-transport-security']).toBeDefined()
  })

  it('should set Content-Security-Policy', async () => {
    const response = await request(app).get('/test')

    expect(response.headers['content-security-policy']).toBeDefined()
  })

  it('should not expose sensitive headers', async () => {
    const response = await request(app).get('/test')

    expect(response.headers['x-powered-by']).toBeUndefined()
  })
})

