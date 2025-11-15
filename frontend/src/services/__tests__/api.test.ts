import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '../api'

global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should make GET request', async () => {
    const mockData = { success: true, data: [] }
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await apiClient.get('/transactions')
    expect(result).toEqual(mockData)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/transactions'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('should make POST request', async () => {
    const mockData = { success: true }
    const postData = { txHash: '0x123' }
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await apiClient.post('/transactions', postData)
    expect(result).toEqual(mockData)
  })

  it('should handle errors', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    })

    await expect(apiClient.get('/invalid')).rejects.toThrow()
  })
})

