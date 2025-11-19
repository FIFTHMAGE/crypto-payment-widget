import { Request, Response, NextFunction } from 'express';

export const validatePayment = (req: Request, res: Response, next: NextFunction) => {
  const { amount, recipient } = req.body;
  if (!amount || !recipient) {
    return res.status(400).json({ error: 'Invalid payment data' });
  }
  next();
};
