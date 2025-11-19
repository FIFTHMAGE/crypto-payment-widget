export const successResponse = (data: any) => ({
  success: true,
  data,
});

export const errorResponse = (message: string, code?: string) => ({
  success: false,
  error: { message, code },
});
