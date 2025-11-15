import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import apiRoutes from '../../routes/index.js'

describe('API Integration Tests', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/', apiRoutes)
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ok')
    })
  })

  describe('API Versioning', () => {
    it('should support v1 API endpoints', async () => {
      const response = await request(app).get('/v1/transactions')

      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for invalid endpoints', async () => {
      const response = await request(app).get('/invalid-endpoint')

      expect(response.status).toBe(404)
    })

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/v1/transactions')
        .set('Content-Type', 'application/json')
        .send('invalid json')

      expect(response.status).toBe(400)
    })
  })

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')

      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = []

      // Make 101 rapid requests
      for (let i = 0; i < 101; i++) {
        requests.push(request(app).get('/health'))
      }

      const responses = await Promise.all(requests)
      const rateLimited = responses.some(r => r.status === 429)

      expect(rateLimited).toBe(true)
    })
  })
})

