import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cacheService } from '../cacheService';

describe('Cache Service', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('set and get', () => {
    it('should set and get values', () => {
      cacheService.set('key1', 'value1');

      expect(cacheService.get('key1')).toBe('value1');
    });

    it('should return undefined for missing keys', () => {
      expect(cacheService.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite existing values', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key1', 'value2');

      expect(cacheService.get('key1')).toBe('value2');
    });

    it('should store complex objects', () => {
      const obj = { nested: { value: 123 }, array: [1, 2, 3] };

      cacheService.set('complex', obj);

      expect(cacheService.get('complex')).toEqual(obj);
    });

    it('should store arrays', () => {
      const arr = [1, 2, 3, 'test', { nested: true }];

      cacheService.set('array', arr);

      expect(cacheService.get('array')).toEqual(arr);
    });

    it('should store null and undefined values', () => {
      cacheService.set('null', null);
      cacheService.set('undefined', undefined);

      expect(cacheService.get('null')).toBeNull();
      expect(cacheService.get('undefined')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      cacheService.set('key1', 'value1');

      expect(cacheService.has('key1')).toBe(true);
    });

    it('should return false for missing keys', () => {
      expect(cacheService.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete values', () => {
      cacheService.set('key1', 'value1');
      cacheService.delete('key1');

      expect(cacheService.get('key1')).toBeUndefined();
      expect(cacheService.has('key1')).toBe(false);
    });

    it('should return true when key existed', () => {
      cacheService.set('key1', 'value1');

      expect(cacheService.delete('key1')).toBe(true);
    });

    it('should return false when key did not exist', () => {
      expect(cacheService.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all values', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');

      cacheService.clear();

      expect(cacheService.get('key1')).toBeUndefined();
      expect(cacheService.get('key2')).toBeUndefined();
      expect(cacheService.get('key3')).toBeUndefined();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire values after TTL', () => {
      vi.useFakeTimers();

      cacheService.set('key1', 'value1', 1000); // 1 second TTL

      expect(cacheService.get('key1')).toBe('value1');

      vi.advanceTimersByTime(1001);

      expect(cacheService.get('key1')).toBeUndefined();
    });

    it('should not expire values without TTL', () => {
      vi.useFakeTimers();

      cacheService.set('key1', 'value1'); // No TTL

      vi.advanceTimersByTime(100000);

      expect(cacheService.get('key1')).toBe('value1');
    });

    it('should reset TTL when value is updated', () => {
      vi.useFakeTimers();

      cacheService.set('key1', 'value1', 1000);

      vi.advanceTimersByTime(500);

      cacheService.set('key1', 'value2', 1000);

      vi.advanceTimersByTime(600);

      expect(cacheService.get('key1')).toBe('value2');

      vi.advanceTimersByTime(500);

      expect(cacheService.get('key1')).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      const stats = cacheService.getStats();

      expect(stats.size).toBe(2);
      expect(stats.hits).toBeDefined();
      expect(stats.misses).toBeDefined();
    });

    it('should track hits and misses', () => {
      cacheService.set('key1', 'value1');

      cacheService.get('key1'); // Hit
      cacheService.get('key1'); // Hit
      cacheService.get('nonexistent'); // Miss

      const stats = cacheService.getStats();

      expect(stats.hits).toBeGreaterThanOrEqual(2);
      expect(stats.misses).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getOrSet', () => {
    it('should get existing value', async () => {
      cacheService.set('key1', 'existing');

      const result = await cacheService.getOrSet('key1', async () => 'computed');

      expect(result).toBe('existing');
    });

    it('should compute and set value when missing', async () => {
      const result = await cacheService.getOrSet('key1', async () => 'computed');

      expect(result).toBe('computed');
      expect(cacheService.get('key1')).toBe('computed');
    });

    it('should set with TTL', async () => {
      vi.useFakeTimers();

      await cacheService.getOrSet('key1', async () => 'computed', 1000);

      expect(cacheService.get('key1')).toBe('computed');

      vi.advanceTimersByTime(1001);

      expect(cacheService.get('key1')).toBeUndefined();
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');

      const keys = cacheService.keys();

      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });
  });

  describe('values', () => {
    it('should return all values', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      const values = cacheService.values();

      expect(values).toHaveLength(2);
      expect(values).toContain('value1');
      expect(values).toContain('value2');
    });
  });
});

