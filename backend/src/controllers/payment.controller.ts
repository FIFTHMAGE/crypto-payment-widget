import { Request, Response } from 'express';

export const createPayment = async (req: Request, res: Response) => {
  const { amount, recipient } = req.body;
  res.json({ success: true, paymentId: 'pay_' + Date.now() });
};

export const getPayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ id, status: 'completed' });
};
