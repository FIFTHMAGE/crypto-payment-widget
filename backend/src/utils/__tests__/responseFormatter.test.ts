import { describe, expect, it } from 'vitest';

import {
  formatError,
  formatPagination,
  formatSuccess,
} from '../responseFormatter';

describe('Response Formatter Utils', () => {
  describe('formatSuccess', () => {
    it('should format success response with data', () => {
      const result = formatSuccess({ id: 1, name: 'Test' });

      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'Test' },
      });
    });

    it('should format success response with message', () => {
      const result = formatSuccess({ id: 1 }, 'Created successfully');

      expect(result).toEqual({
        success: true,
        data: { id: 1 },
        message: 'Created successfully',
      });
    });

    it('should handle null data', () => {
      const result = formatSuccess(null);

      expect(result).toEqual({
        success: true,
        data: null,
      });
    });

    it('should handle array data', () => {
      const result = formatSuccess([1, 2, 3]);

      expect(result).toEqual({
        success: true,
        data: [1, 2, 3],
      });
    });

    it('should handle empty object', () => {
      const result = formatSuccess({});

      expect(result).toEqual({
        success: true,
        data: {},
      });
    });

    it('should include metadata if provided', () => {
      const result = formatSuccess(
        { id: 1 },
        'Success',
        { requestId: 'abc123' }
      );

      expect(result).toEqual({
        success: true,
        data: { id: 1 },
        message: 'Success',
        meta: { requestId: 'abc123' },
      });
    });
  });

  describe('formatError', () => {
    it('should format error response', () => {
      const result = formatError('Something went wrong');

      expect(result).toEqual({
        success: false,
        error: 'Something went wrong',
        statusCode: 500,
      });
    });

    it('should format error with custom status code', () => {
      const result = formatError('Not found', 404);

      expect(result).toEqual({
        success: false,
        error: 'Not found',
        statusCode: 404,
      });
    });

    it('should format error with details', () => {
      const result = formatError('Validation failed', 400, {
        field: 'email',
        message: 'Invalid email format',
      });

      expect(result).toEqual({
        success: false,
        error: 'Validation failed',
        statusCode: 400,
        details: {
          field: 'email',
          message: 'Invalid email format',
        },
      });
    });

    it('should format error with errors array', () => {
      const result = formatError('Validation failed', 400, {
        errors: [
          { field: 'name', message: 'Required' },
          { field: 'email', message: 'Invalid' },
        ],
      });

      expect(result.details?.errors).toHaveLength(2);
    });

    it('should handle 401 unauthorized', () => {
      const result = formatError('Unauthorized', 401);

      expect(result.statusCode).toBe(401);
    });

    it('should handle 403 forbidden', () => {
      const result = formatError('Forbidden', 403);

      expect(result.statusCode).toBe(403);
    });

    it('should handle 429 rate limit', () => {
      const result = formatError('Too many requests', 429, {
        retryAfter: 60,
      });

      expect(result.statusCode).toBe(429);
      expect(result.details?.retryAfter).toBe(60);
    });
  });

  describe('formatPagination', () => {
    it('should format paginated response', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = formatPagination(items, 50, 1, 10);

      expect(result).toEqual({
        success: true,
        data: items,
        pagination: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
          hasNext: true,
          hasPrev: false,
        },
      });
    });

    it('should calculate total pages correctly', () => {
      const result = formatPagination([], 25, 1, 10);

      expect(result.pagination.totalPages).toBe(3);
    });

    it('should handle exact page division', () => {
      const result = formatPagination([], 30, 1, 10);

      expect(result.pagination.totalPages).toBe(3);
    });

    it('should handle single page', () => {
      const result = formatPagination([{ id: 1 }], 5, 1, 10);

      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should indicate hasNext correctly', () => {
      const result1 = formatPagination([], 50, 1, 10);
      const result2 = formatPagination([], 50, 5, 10);

      expect(result1.pagination.hasNext).toBe(true);
      expect(result2.pagination.hasNext).toBe(false);
    });

    it('should indicate hasPrev correctly', () => {
      const result1 = formatPagination([], 50, 1, 10);
      const result2 = formatPagination([], 50, 3, 10);

      expect(result1.pagination.hasPrev).toBe(false);
      expect(result2.pagination.hasPrev).toBe(true);
    });

    it('should handle zero items', () => {
      const result = formatPagination([], 0, 1, 10);

      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
    });

    it('should include offset', () => {
      const result = formatPagination([], 50, 3, 10);

      expect(result.pagination.offset).toBe(20);
    });

    it('should handle last page with fewer items', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const result = formatPagination(items, 22, 3, 10);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.totalPages).toBe(3);
    });
  });
});

