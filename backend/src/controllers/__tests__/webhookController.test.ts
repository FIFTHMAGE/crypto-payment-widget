import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type NextFunction, type Request, type Response } from 'express';

import * as webhookController from '../webhookController';

describe('Webhook Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      headers: {},
      params: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('registerWebhook', () => {
    it('should register webhook successfully', async () => {
      mockRequest.body = {
        url: 'https://example.com/webhook',
        events: ['transaction.created', 'transaction.confirmed'],
      };

      await webhookController.registerWebhook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            url: 'https://example.com/webhook',
            events: expect.arrayContaining(['transaction.created']),
            active: true,
          }),
        })
      );
    });

    it('should reject webhook without URL', async () => {
      mockRequest.body = {
        events: ['transaction.created'],
      };

      await webhookController.registerWebhook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should reject webhook with invalid URL', async () => {
      mockRequest.body = {
        url: 'not-a-valid-url',
        events: ['transaction.created'],
      };

      await webhookController.registerWebhook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getWebhooks', () => {
    it('should list all webhooks', async () => {
      await webhookController.getWebhooks(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        })
      );
    });
  });

  describe('getWebhookById', () => {
    it('should return 404 for non-existent webhook', async () => {
      mockRequest.params = { id: 'non-existent-id' };

      await webhookController.getWebhookById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteWebhook', () => {
    it('should return 404 for non-existent webhook', async () => {
      mockRequest.params = { id: 'non-existent-id' };

      await webhookController.deleteWebhook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateWebhook', () => {
    it('should return 404 for non-existent webhook', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { url: 'https://new-url.com/webhook' };

      await webhookController.updateWebhook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});

