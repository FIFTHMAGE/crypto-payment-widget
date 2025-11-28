import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type NextFunction, type Request, type Response } from 'express';

import * as analyticsController from '../analyticsController';

describe('Analytics Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
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

  describe('getTransactionAnalyticsController', () => {
    it('should return transaction analytics with default time range', async () => {
      await analyticsController.getTransactionAnalyticsController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            analytics: expect.any(Object),
          }),
        })
      );
    });

    it('should accept custom time range', async () => {
      mockRequest.query = { timeRange: '7d' };

      await analyticsController.getTransactionAnalyticsController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('getVolumeAnalyticsController', () => {
    it('should return volume analytics by token', async () => {
      await analyticsController.getVolumeAnalyticsController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            volumeByToken: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('getUserAnalyticsController', () => {
    it('should return user analytics', async () => {
      await analyticsController.getUserAnalyticsController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            users: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('getTimeSeriesController', () => {
    it('should return time series data with defaults', async () => {
      await analyticsController.getTimeSeriesController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            timeSeries: expect.any(Array),
            interval: 'hour',
            points: 24,
          }),
        })
      );
    });

    it('should accept custom interval and points', async () => {
      mockRequest.query = { interval: 'day', points: '7' };

      await analyticsController.getTimeSeriesController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            interval: 'day',
            points: 7,
          }),
        })
      );
    });
  });

  describe('getPlatformMetricsController', () => {
    it('should return platform metrics', async () => {
      await analyticsController.getPlatformMetricsController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            metrics: expect.any(Object),
          }),
        })
      );
    });
  });
});

