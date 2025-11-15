import { describe, it, expect } from 'vitest'
import { formatError, isNetworkError, isUserRejectedError } from '../error'

describe('Error Utils', () => {
  it('should format generic errors', () => {
    const error = new Error('Test error')
    const formatted = formatError(error)
    expect(formatted).toContain('Test error')
  })

  it('should detect network errors', () => {
    const networkError = new Error('Network request failed')
    expect(isNetworkError(networkError)).toBe(true)

    const normalError = new Error('Something else')
    expect(isNetworkError(normalError)).toBe(false)
  })

  it('should detect user rejected errors', () => {
    const rejectedError = new Error('User rejected the request')
    expect(isUserRejectedError(rejectedError)).toBe(true)

    const normalError = new Error('Something else')
    expect(isUserRejectedError(normalError)).toBe(false)
  })

  it('should handle unknown error types', () => {
    const unknown = { message: 'Unknown' }
    const formatted = formatError(unknown)
    expect(formatted).toBeTruthy()
  })
})

