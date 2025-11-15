import { describe, it, expect, beforeEach } from 'vitest'
import { getItem, setItem, removeItem, clear } from '../storage'

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should set and get items', () => {
    setItem('test-key', { value: 123 })
    const result = getItem('test-key')
    expect(result).toEqual({ value: 123 })
  })

  it('should return null for non-existent keys', () => {
    const result = getItem('non-existent')
    expect(result).toBeNull()
  })

  it('should remove items', () => {
    setItem('test-key', 'value')
    removeItem('test-key')
    expect(getItem('test-key')).toBeNull()
  })

  it('should clear all items', () => {
    setItem('key1', 'value1')
    setItem('key2', 'value2')
    clear()
    expect(getItem('key1')).toBeNull()
    expect(getItem('key2')).toBeNull()
  })

  it('should handle invalid JSON', () => {
    localStorage.setItem('invalid', '{invalid json')
    const result = getItem('invalid')
    expect(result).toBeNull()
  })
})

