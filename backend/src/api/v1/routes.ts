/** API v1 Routes - API versioning */
import { Router } from 'express';
const router = Router();

router.get('/payments', (req, res) => res.json({ version: 'v1', payments: [] }));
router.post('/payments', (req, res) => res.json({ version: 'v1', payment: req.body }));

export default router;

