import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type NextFunction, type Request, type Response } from 'express';

import { AppError, errorHandler } from '../errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    mockRequest = {
      path: '/test',
      method: 'GET',
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('errorHandler', () => {
    it('should handle generic errors with 500 status', () => {
      const error = new Error('Test error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should handle AppError with custom status code', () => {
      const error = new AppError('Not found', 404);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Not found',
        })
      );
    });

    it('should handle errors with statusCode property', () => {
      const error: Error & { statusCode?: number } = new Error('Forbidden');
      error.statusCode = 403;

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );
    });

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Prod error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const jsonCall = (mockResponse.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(jsonCall.stack).toBeUndefined();
    });

    it('should handle validation errors (isJoi)', () => {
      const error = {
        isJoi: true,
        details: [{ message: '"name" is required' }],
      };

      errorHandler(error as unknown as Error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle JSON parse errors', () => {
      const error = new SyntaxError('Unexpected token');
      (error as Error & { type?: string }).type = 'entity.parse.failed';

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should default to 500 status code', () => {
      const error = new AppError('Server error');

      expect(error.statusCode).toBe(500);
    });

    it('should have correct status based on status code', () => {
      const error4xx = new AppError('Bad request', 400);
      const error5xx = new AppError('Server error', 500);

      expect(error4xx.status).toBe('fail');
      expect(error5xx.status).toBe('error');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test');

      expect(error.stack).toBeDefined();
    });
  });
});

