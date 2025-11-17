/** DDoS Protection */
export const ddosProtection = (req: any, res: any, next: any) => {
  const ip = req.ip;
  const requestCount = getRequestCount(ip);
  if (requestCount > 1000) return res.status(429).json({ error: 'Too many requests' });
  next();
};
const getRequestCount = (ip: string) => 0;

