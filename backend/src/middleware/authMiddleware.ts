/** Authorization Middleware */
export const authorize = (requiredRole: string) => (req: any, res: any, next: any) => {
  const userRole = req.user?.role;
  if (userRole !== requiredRole) return res.status(403).json({ error: 'Forbidden' });
  next();
};

