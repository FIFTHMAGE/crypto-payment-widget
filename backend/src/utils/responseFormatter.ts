/**
 * Response formatter utilities
 */

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  statusCode: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Format a success response
 */
export const formatSuccess = <T>(data: T, message = 'Success'): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Alias for formatSuccess
 */
export const successResponse = formatSuccess;

/**
 * Format an error response
 */
export const formatError = (
  error: Error | string,
  statusCode = 500,
  code?: string,
  details?: Record<string, unknown>
): ErrorResponse => ({
  success: false,
  error: typeof error === 'string' ? error : error.message || 'Internal Server Error',
  code,
  statusCode,
  timestamp: new Date().toISOString(),
  details,
});

/**
 * Alias for formatError
 */
export const errorResponse = formatError;

/**
 * Format a paginated response
 */
export const formatPagination = <T>(
  items: T[],
  total: number,
  limit: number,
  offset: number
): PaginatedResponse<T> => ({
  items,
  pagination: {
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit) || 1,
  },
});

/**
 * Alias for formatPagination
 */
export const paginatedResponse = formatPagination;

/**
 * Create pagination meta from query params
 */
export const createPaginationMeta = (
  total: number,
  query: { limit?: number | string; offset?: number | string; page?: number | string }
): PaginationMeta => {
  const limit = parseInt(String(query.limit || 10), 10);
  const offset = query.page
    ? (parseInt(String(query.page), 10) - 1) * limit
    : parseInt(String(query.offset || 0), 10);

  return {
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

/**
 * Format a list response with optional pagination
 */
export const formatList = <T>(
  items: T[],
  options?: {
    total?: number;
    limit?: number;
    offset?: number;
    message?: string;
  }
): SuccessResponse<T[] | PaginatedResponse<T>> => {
  if (options?.total !== undefined && options?.limit !== undefined && options?.offset !== undefined) {
    return formatSuccess(
      formatPagination(items, options.total, options.limit, options.offset),
      options.message || 'Success'
    );
  }

  return formatSuccess(items, options?.message || 'Success');
};

export default {
  formatSuccess,
  successResponse,
  formatError,
  errorResponse,
  formatPagination,
  paginatedResponse,
  createPaginationMeta,
  formatList,
};

