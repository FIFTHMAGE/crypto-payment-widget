export const formatSuccess = (data, message = 'Success') => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
})

export const formatError = (error, statusCode = 500) => ({
  success: false,
  error: error.message || 'Internal Server Error',
  statusCode,
  timestamp: new Date().toISOString(),
})

export const formatPagination = (items, total, limit, offset) => ({
  items,
  pagination: {
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
  },
})

