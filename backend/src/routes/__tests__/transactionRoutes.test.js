import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import transactionRoutes from '../transactionRoutes.js'

describe('Transaction Routes', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/transactions', transactionRoutes)
  })

  describe('POST /transactions', () => {
    it('should create new transaction', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          txHash: '0x123abc456def789',
          from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
          to: '0x456def789abc123def456abc789def123abc456d',
          amount: '0.01',
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.transaction).toBeDefined()
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/transactions')
        .send({
          txHash: '0x123',
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /transactions', () => {
    it('should return list of transactions', async () => {
      const response = await request(app).get('/transactions')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/transactions')
        .query({ page: 1, limit: 5 })

      expect(response.status).toBe(200)
      expect(response.body.pagination).toBeDefined()
    })
  })

  describe('GET /transactions/:txHash', () => {
    it('should return specific transaction', async () => {
      // First create a transaction
      await request(app)
        .post('/transactions')
        .send({
          txHash: '0x789',
          from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9',
          to: '0x456def789abc123def456abc789def123abc456d',
          amount: '0.01',
        })

      const response = await request(app).get('/transactions/0x789')

      expect(response.status).toBe(200)
      expect(response.body.transaction.txHash).toBe('0x789')
    })

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app).get('/transactions/0xnonexistent')

      expect(response.status).toBe(404)
    })
  })
})

