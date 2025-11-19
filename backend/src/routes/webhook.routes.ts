import express from 'express';

const router = express.Router();

router.post('/transaction', async (req, res) => {
  try {
    const { event, data } = req.body;
    // Webhook processing logic
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
