import { describe, it, expect } from 'vitest'
import { unique, groupBy, chunk, shuffle, sortBy } from '../array'

describe('Array Utils', () => {
  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })
  })

  describe('groupBy', () => {
    it('should group items by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ]
      const result = groupBy(items, 'type')
      expect(result.a).toHaveLength(2)
      expect(result.b).toHaveLength(1)
    })
  })

  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })
  })

  describe('shuffle', () => {
    it('should shuffle array', () => {
      const arr = [1, 2, 3, 4, 5]
      const shuffled = shuffle([...arr])
      expect(shuffled).toHaveLength(arr.length)
      expect(shuffled).toContain(1)
    })
  })

  describe('sortBy', () => {
    it('should sort by property', () => {
      const items = [
        { name: 'c', value: 3 },
        { name: 'a', value: 1 },
        { name: 'b', value: 2 },
      ]
      const sorted = sortBy(items, 'name')
      expect(sorted[0].name).toBe('a')
      expect(sorted[2].name).toBe('c')
    })
  })
})

