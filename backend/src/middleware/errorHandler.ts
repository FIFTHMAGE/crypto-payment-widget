/** Error Handler - Centralized error handling */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: { message: err.message, code: err.code || 'INTERNAL_ERROR' }
  });
};

