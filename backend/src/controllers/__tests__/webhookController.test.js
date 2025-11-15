import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import * as webhookController from '../webhookController.js'

describe('Webhook Controller', () => {
  let req, res, next

  beforeEach(() => {
    req = { body: {}, headers: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
  })

  it('should register webhook', async () => {
    req.body = {
      url: 'https://example.com/webhook',
      events: ['transaction.created'],
    }

    await webhookController.registerWebhook(req, res, next)

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('should list webhooks', async () => {
    await webhookController.listWebhooks(req, res, next)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        webhooks: expect.any(Array),
      })
    )
  })
})

