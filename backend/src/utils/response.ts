/**
 * Response utilities - Standard API response formats
 * @module utils
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, error: string, statusCode: number = 400): Response {
    const response: ApiResponse = {
      success: false,
      error,
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: { page: number; limit: number; total: number; totalPages: number },
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      pagination,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static badRequest(res: Response, message: string = 'Bad request'): Response {
    return this.error(res, message, 400);
  }

  static serverError(res: Response, message: string = 'Internal server error'): Response {
    return this.error(res, message, 500);
  }
}
