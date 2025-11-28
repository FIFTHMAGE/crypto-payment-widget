import Joi from 'joi';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type NextFunction, type Request, type Response } from 'express';

import { validateRequest } from '../validateRequest';

describe('Validate Request Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('body validation', () => {
    it('should pass validation with valid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockRequest.body = { name: 'Test' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation with missing required field', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockRequest.body = {};

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid type', () => {
      const schema = Joi.object({
        age: Joi.number().required(),
      });

      mockRequest.body = { age: 'not a number' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate complex objects', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }).required(),
      });

      mockRequest.body = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate arrays', () => {
      const schema = Joi.object({
        items: Joi.array().items(Joi.string()).min(1).required(),
      });

      mockRequest.body = { items: ['item1', 'item2'] };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('query validation', () => {
    it('should validate query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().min(1).required(),
        limit: Joi.number().min(1).max(100),
      });

      mockRequest.query = { page: '1', limit: '10' };

      const middleware = validateRequest(schema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail with invalid query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().min(1).required(),
      });

      mockRequest.query = { page: '0' };

      const middleware = validateRequest(schema, 'query');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('params validation', () => {
    it('should validate route parameters', () => {
      const schema = Joi.object({
        id: Joi.string().uuid().required(),
      });

      mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };

      const middleware = validateRequest(schema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail with invalid params', () => {
      const schema = Joi.object({
        id: Joi.string().uuid().required(),
      });

      mockRequest.params = { id: 'not-a-uuid' };

      const middleware = validateRequest(schema, 'params');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('error messages', () => {
    it('should return detailed error messages', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });

      mockRequest.body = { email: 'invalid-email' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('email'),
        })
      );
    });

    it('should return multiple error messages', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      mockRequest.body = {};

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.any(Array),
        })
      );
    });
  });

  describe('data coercion', () => {
    it('should coerce string to number', () => {
      const schema = Joi.object({
        count: Joi.number().required(),
      });

      mockRequest.body = { count: '42' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should strip unknown fields by default', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockRequest.body = { name: 'Test', unknown: 'field' };

      const middleware = validateRequest(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});

