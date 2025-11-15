import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial value when key does not exist', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('initial')
  })

  it('should persist value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
  })

  it('should load existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('existing'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
    expect(result.current[0]).toBe('existing')
  })

  it('should handle objects', () => {
    const obj = { name: 'test', value: 123 }
    const { result } = renderHook(() => useLocalStorage('test-obj', obj))

    expect(result.current[0]).toEqual(obj)

    act(() => {
      result.current[1]({ name: 'updated', value: 456 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', value: 456 })
  })

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-counter', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(2)
  })
})

