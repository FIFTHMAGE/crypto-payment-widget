import { describe, it, expect, vi } from 'vitest'
import { retry, timeout, promiseWithTimeout, sequential } from '../async'

describe('Async Utils', () => {
  describe('retry', () => {
    it('should retry failed promises', async () => {
      let attempts = 0
      const fn = vi.fn(async () => {
        attempts++
        if (attempts < 3) throw new Error('Fail')
        return 'success'
      })

      const result = await retry(fn, 3)
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('should throw after max attempts', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Always fails')
      })

      await expect(retry(fn, 2)).rejects.toThrow('Always fails')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('timeout', () => {
    it('should resolve within timeout', async () => {
      const fn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'done'
      }

      const result = await timeout(fn(), 100)
      expect(result).toBe('done')
    })

    it('should reject on timeout', async () => {
      const fn = async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return 'done'
      }

      await expect(timeout(fn(), 50)).rejects.toThrow('Timeout')
    })
  })

  describe('sequential', () => {
    it('should execute promises sequentially', async () => {
      const order: number[] = []
      const fns = [
        async () => { order.push(1); return 1 },
        async () => { order.push(2); return 2 },
        async () => { order.push(3); return 3 },
      ]

      const results = await sequential(fns)
      expect(results).toEqual([1, 2, 3])
      expect(order).toEqual([1, 2, 3])
    })
  })
})

