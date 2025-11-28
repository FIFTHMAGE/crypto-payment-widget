import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type NextFunction, type Request, type Response } from 'express';

import { createRateLimiter, rateLimiter } from '../rateLimiter';

describe('Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      headers: {},
      path: '/api/test',
      method: 'GET',
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rateLimiter', () => {
    it('should allow requests under limit', () => {
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should set rate limit headers', () => {
      rateLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        expect.any(Number)
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        expect.any(Number)
      );
    });

    it('should decrement remaining count', () => {
      const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });

      limiter(mockRequest as Request, mockResponse as Response, mockNext);

      const setHeaderCalls = (mockResponse.setHeader as ReturnType<typeof vi.fn>).mock.calls;
      const remainingHeader = setHeaderCalls.find((call) => call[0] === 'X-RateLimit-Remaining');
      
      expect(remainingHeader?.[1]).toBe(9);
    });

    it('should block requests over limit', () => {
      const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60000 });

      for (let i = 0; i < 4; i++) {
        limiter(mockRequest as Request, mockResponse as Response, mockNext);
      }

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Too many requests'),
        })
      );
    });

    it('should reset after time window', () => {
      vi.useFakeTimers();

      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });

      // Use up all requests
      limiter(mockRequest as Request, mockResponse as Response, mockNext);
      limiter(mockRequest as Request, mockResponse as Response, mockNext);
      limiter(mockRequest as Request, mockResponse as Response, mockNext); // Should be blocked

      expect(mockResponse.status).toHaveBeenCalledWith(429);

      // Reset mocks
      vi.clearAllMocks();
      mockNext = vi.fn();
      mockResponse.status = vi.fn().mockReturnThis();
      mockResponse.json = vi.fn().mockReturnThis();
      mockResponse.setHeader = vi.fn();

      // Advance time past window
      vi.advanceTimersByTime(1001);

      // Should be allowed again
      limiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should track by IP address', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });

      // First IP uses 2 requests
      limiter(mockRequest as Request, mockResponse as Response, mockNext);
      limiter(mockRequest as Request, mockResponse as Response, mockNext);

      // Second IP should still have quota
      mockRequest.ip = '192.168.1.1';
      mockNext = vi.fn();
      mockResponse.status = vi.fn().mockReturnThis();

      limiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should use X-Forwarded-For header if present', () => {
      const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });
      mockRequest.headers = { 'x-forwarded-for': '10.0.0.1' };

      limiter(mockRequest as Request, mockResponse as Response, mockNext);
      limiter(mockRequest as Request, mockResponse as Response, mockNext);

      // Change direct IP but keep same forwarded IP
      mockRequest.ip = '127.0.0.2';
      mockNext = vi.fn();

      limiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
    });

    it('should set Retry-After header when blocked', () => {
      const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });

      limiter(mockRequest as Request, mockResponse as Response, mockNext);
      limiter(mockRequest as Request, mockResponse as Response, mockNext); // Should be blocked

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Retry-After',
        expect.any(Number)
      );
    });
  });

  describe('createRateLimiter', () => {
    it('should create limiter with custom options', () => {
      const limiter = createRateLimiter({
        maxRequests: 5,
        windowMs: 30000,
      });

      limiter(mockRequest as Request, mockResponse as Response, mockNext);

      const setHeaderCalls = (mockResponse.setHeader as ReturnType<typeof vi.fn>).mock.calls;
      const limitHeader = setHeaderCalls.find((call) => call[0] === 'X-RateLimit-Limit');

      expect(limitHeader?.[1]).toBe(5);
    });

    it('should support skip function', () => {
      const limiter = createRateLimiter({
        maxRequests: 1,
        windowMs: 60000,
        skip: (req) => req.path === '/api/health',
      });

      mockRequest.path = '/api/health';

      // Should skip rate limiting
      for (let i = 0; i < 10; i++) {
        limiter(mockRequest as Request, mockResponse as Response, mockNext);
      }

      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should support key generator function', () => {
      const limiter = createRateLimiter({
        maxRequests: 2,
        windowMs: 60000,
        keyGenerator: (req) => req.headers['x-api-key'] as string || 'anonymous',
      });

      mockRequest.headers = { 'x-api-key': 'user-123' };

      limiter(mockRequest as Request, mockResponse as Response, mockNext);
      limiter(mockRequest as Request, mockResponse as Response, mockNext);
      limiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
    });
  });
});

