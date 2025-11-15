import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import * as systemController from '../systemController.js'

describe('System Controller', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
  })

  it('should return system metrics', async () => {
    await systemController.getMetrics(req, res, next)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        uptime: expect.any(Number),
        memory: expect.any(Object),
      })
    )
  })

  it('should return version info', async () => {
    await systemController.getVersion(req, res, next)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        version: expect.any(String),
      })
    )
  })
})

