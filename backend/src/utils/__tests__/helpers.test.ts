import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  chunk,
  debounce,
  formatCurrency,
  generateId,
  parseJSON,
  retry,
  sleep,
  throttle,
} from '../helpers';

describe('Helper Utils', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      vi.useFakeTimers();
      const start = Date.now();

      const sleepPromise = sleep(100);
      vi.advanceTimersByTime(100);
      await sleepPromise;

      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should resolve without value', async () => {
      vi.useFakeTimers();
      const sleepPromise = sleep(10);
      vi.advanceTimersByTime(10);
      const result = await sleepPromise;

      expect(result).toBeUndefined();
    });
  });

  describe('retry', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await retry(fn, 3);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) throw new Error('Fail');
        return 'success';
      };

      const result = await retry(fn, 3);

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retry(fn, 2)).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use delay between retries', async () => {
      vi.useFakeTimers();
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 2) throw new Error('Fail');
        return 'success';
      };

      const retryPromise = retry(fn, 3, 100);

      expect(attempts).toBe(1);
      await vi.advanceTimersByTimeAsync(100);
      expect(attempts).toBe(2);

      await retryPromise;
    });
  });

  describe('parseJSON', () => {
    it('should parse valid JSON', () => {
      const result = parseJSON('{"name": "test"}');
      expect(result).toEqual({ name: 'test' });
    });

    it('should return default for invalid JSON', () => {
      const result = parseJSON('invalid', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('should return null for invalid JSON without default', () => {
      const result = parseJSON('invalid');
      expect(result).toBeNull();
    });

    it('should handle empty string', () => {
      const result = parseJSON('', 'default');
      expect(result).toBe('default');
    });

    it('should parse arrays', () => {
      const result = parseJSON('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('chunk', () => {
    it('should split array into chunks', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      const result = chunk(arr, 3);

      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should handle exact divisions', () => {
      const arr = [1, 2, 3, 4];
      const result = chunk(arr, 2);

      expect(result).toEqual([[1, 2], [3, 4]]);
    });

    it('should handle empty arrays', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it('should handle chunk size larger than array', () => {
      const arr = [1, 2];
      const result = chunk(arr, 5);

      expect(result).toEqual([[1, 2]]);
    });

    it('should handle chunk size of 1', () => {
      const arr = [1, 2, 3];
      const result = chunk(arr, 1);

      expect(result).toEqual([[1], [2], [3]]);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to function', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('arg1', 'arg2');

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should reset timer on each call', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      throttled();
      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to function', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('arg1', 'arg2');

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('1,234.56');
    });

    it('should format EUR currency', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('1,234.56');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toContain('0');
    });

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000, 'USD');
      expect(result).toContain('1,000,000');
    });

    it('should handle decimal places', () => {
      const result = formatCurrency(1.1, 'USD', 2);
      expect(result).toContain('1.10');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with default length', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate IDs with custom prefix', () => {
      const id = generateId('tx');
      expect(id.startsWith('tx')).toBe(true);
    });

    it('should be URL-safe', () => {
      const id = generateId();
      expect(/^[a-zA-Z0-9_-]+$/.test(id)).toBe(true);
    });
  });
});

