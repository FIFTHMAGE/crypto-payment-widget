import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import * as analyticsController from '../analyticsController.js'

describe('Analytics Controller', () => {
  let req, res, next

  beforeEach(() => {
    req = { query: {}, params: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
  })

  it('should return transaction stats', async () => {
    await analyticsController.getTransactionStats(req, res, next)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        stats: expect.any(Object),
      })
    )
  })

  it('should return volume analytics', async () => {
    await analyticsController.getVolumeAnalytics(req, res, next)

    expect(res.json).toHaveBeenCalled()
  })
})

