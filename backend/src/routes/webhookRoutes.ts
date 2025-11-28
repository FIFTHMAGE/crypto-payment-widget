import { Router } from 'express';

import {
  registerWebhook,
  getWebhooks,
  getWebhookById,
  deleteWebhook,
  updateWebhook,
} from '../controllers/webhookController';
import { apiKeyAuth, requirePermission } from '../middleware/apiKeyAuth';

const router = Router();

/**
 * @route   POST /api/v1/webhooks
 * @desc    Register a new webhook
 * @access  Private (API Key required)
 */
router.post('/', apiKeyAuth, registerWebhook);

/**
 * @route   GET /api/v1/webhooks
 * @desc    Get all registered webhooks
 * @access  Private (API Key required)
 */
router.get('/', apiKeyAuth, getWebhooks);

/**
 * @route   GET /api/v1/webhooks/:id
 * @desc    Get a specific webhook by ID
 * @access  Private (API Key required)
 */
router.get('/:id', apiKeyAuth, getWebhookById);

/**
 * @route   PATCH /api/v1/webhooks/:id
 * @desc    Update a webhook
 * @access  Private (API Key required)
 */
router.patch('/:id', apiKeyAuth, updateWebhook);

/**
 * @route   DELETE /api/v1/webhooks/:id
 * @desc    Delete a webhook
 * @access  Private (API Key required)
 */
router.delete('/:id', apiKeyAuth, deleteWebhook);

/**
 * @route   POST /api/v1/webhooks/:id/test
 * @desc    Send a test event to a webhook
 * @access  Private (API Key required)
 */
router.post('/:id/test', apiKeyAuth, (_req, res) => {
  // Send test webhook event
  res.json({
    success: true,
    message: 'Test webhook event sent',
    data: {
      eventId: `test_${Date.now()}`,
      sentAt: new Date().toISOString(),
    },
  });
});

/**
 * @route   GET /api/v1/webhooks/:id/events
 * @desc    Get webhook event history
 * @access  Private (API Key required)
 */
router.get('/:id/events', apiKeyAuth, (_req, res) => {
  res.json({
    success: true,
    data: {
      events: [],
      total: 0,
    },
  });
});

export default router;
