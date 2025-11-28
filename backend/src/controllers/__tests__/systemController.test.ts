import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type NextFunction, type Request, type Response } from 'express';

import * as systemController from '../systemController';

describe('System Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('getSystemInfo', () => {
    it('should return system information', async () => {
      await systemController.getSystemInfo(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            status: expect.any(String),
            uptime: expect.any(Number),
            memory: expect.any(Object),
            timestamp: expect.any(String),
            version: expect.any(String),
            node: expect.any(String),
            env: expect.any(String),
          }),
        })
      );
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', async () => {
      await systemController.clearCache(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('cleared'),
        })
      );
    });
  });

  describe('getLogs', () => {
    it('should return logs endpoint information', async () => {
      await systemController.getLogs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        })
      );
    });
  });

  describe('getHealthCheck', () => {
    it('should return health check status', async () => {
      await systemController.getHealthCheck(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            status: expect.any(String),
            timestamp: expect.any(String),
            checks: expect.any(Object),
          }),
        })
      );
    });
  });
});

