import express from 'express'
import {
  registerWebhook,
  getWebhooks,
  deleteWebhook,
} from '../controllers/webhookController.js'

const router = express.Router()

router.post('/', registerWebhook)
router.get('/', getWebhooks)
router.delete('/:id', deleteWebhook)

export default router

