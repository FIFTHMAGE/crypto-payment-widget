/**
 * Pagination utilities
 * @module utils
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginationUtil {
  static validate(page: number, limit: number): { page: number; limit: number } {
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    return { page: validPage, limit: validLimit };
  }

  static calculate(page: number, limit: number, total: number): PaginationResult {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}

