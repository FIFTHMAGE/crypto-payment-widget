import { describe, it, expect } from '@jest/globals'
import { success, error, paginated } from '../responseFormatter.js'

describe('Response Formatter Utils', () => {
  describe('success', () => {
    it('should format success response', () => {
      const result = success({ id: 1 }, 'Success message')
      
      expect(result).toEqual({
        success: true,
        data: { id: 1 },
        message: 'Success message',
      })
    })

    it('should work without message', () => {
      const result = success({ id: 1 })
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1 })
    })
  })

  describe('error', () => {
    it('should format error response', () => {
      const result = error('Error message', 400)
      
      expect(result).toEqual({
        success: false,
        error: 'Error message',
        statusCode: 400,
      })
    })

    it('should default to 500 status code', () => {
      const result = error('Error')
      
      expect(result.statusCode).toBe(500)
    })

    it('should include error details', () => {
      const result = error('Error', 400, { field: 'email' })
      
      expect(result.details).toEqual({ field: 'email' })
    })
  })

  describe('paginated', () => {
    it('should format paginated response', () => {
      const items = [{ id: 1 }, { id: 2 }]
      const result = paginated(items, 50, 1, 10)
      
      expect(result).toEqual({
        success: true,
        data: items,
        pagination: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
        },
      })
    })

    it('should calculate total pages correctly', () => {
      const result = paginated([], 25, 1, 10)
      
      expect(result.pagination.totalPages).toBe(3)
    })
  })
})

