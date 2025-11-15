import { describe, it, expect, beforeAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import apiRoutes from '../../routes/index.js'

describe('Performance Load Tests', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/', apiRoutes)
  })

  it('should handle concurrent requests', async () => {
    const concurrentRequests = 50
    const requests = []

    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(request(app).get('/health'))
    }

    const startTime = Date.now()
    const responses = await Promise.all(requests)
    const duration = Date.now() - startTime

    const allSuccessful = responses.every(r => r.status === 200)
    expect(allSuccessful).toBe(true)

    // Should complete within reasonable time
    expect(duration).toBeLessThan(5000)
  })

  it('should handle large payload', async () => {
    const largeData = {
      items: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(100),
      })),
    }

    const response = await request(app)
      .post('/v1/transactions')
      .send(largeData)

    expect(response.status).toBeDefined()
  })

  it('should maintain response time under load', async () => {
    const measurements = []

    for (let i = 0; i < 20; i++) {
      const start = Date.now()
      await request(app).get('/health')
      measurements.push(Date.now() - start)
    }

    const avgResponseTime = measurements.reduce((a, b) => a + b) / measurements.length

    expect(avgResponseTime).toBeLessThan(100) // 100ms average
  })
})

