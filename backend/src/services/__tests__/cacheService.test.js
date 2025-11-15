import { describe, it, expect, beforeEach, vi } from '@jest/globals'
import { get, set, del, clear, has } from '../cacheService.js'

describe('Cache Service', () => {
  beforeEach(() => {
    clear()
  })

  it('should set and get values', () => {
    set('key1', 'value1')
    
    expect(get('key1')).toBe('value1')
  })

  it('should return undefined for missing keys', () => {
    expect(get('nonexistent')).toBeUndefined()
  })

  it('should delete values', () => {
    set('key1', 'value1')
    del('key1')
    
    expect(get('key1')).toBeUndefined()
  })

  it('should check if key exists', () => {
    set('key1', 'value1')
    
    expect(has('key1')).toBe(true)
    expect(has('key2')).toBe(false)
  })

  it('should clear all values', () => {
    set('key1', 'value1')
    set('key2', 'value2')
    
    clear()
    
    expect(get('key1')).toBeUndefined()
    expect(get('key2')).toBeUndefined()
  })

  it('should handle TTL expiration', async () => {
    vi.useFakeTimers()
    
    set('key1', 'value1', 1000) // 1 second TTL
    
    expect(get('key1')).toBe('value1')
    
    vi.advanceTimersByTime(1001)
    
    expect(get('key1')).toBeUndefined()
    
    vi.useRealTimers()
  })

  it('should store complex objects', () => {
    const obj = { nested: { value: 123 } }
    
    set('complex', obj)
    
    expect(get('complex')).toEqual(obj)
  })
})

