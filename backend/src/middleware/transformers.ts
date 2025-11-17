/** Transformers - Request/response transformation layer */
export const transformRequest = (req: any, res: any, next: any) => {
  req.body = { ...req.body, timestamp: Date.now() };
  next();
};

export const transformResponse = (data: any) => ({
  success: true,
  data,
  timestamp: Date.now()
});

