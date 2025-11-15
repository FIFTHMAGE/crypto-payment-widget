import logger from '../utils/logger.js'
import axios from 'axios'

/**
 * Webhook Service
 * Handles webhook registration and event delivery
 */

// In-memory storage for webhooks (replace with DB in production)
const webhooks = new Map()

/**
 * Register a webhook
 */
export const registerWebhook = (webhookData) => {
  try {
    const { url, events, secret, description } = webhookData

    if (!url || !events || events.length === 0) {
      throw new Error('URL and events are required')
    }

    // Validate URL
    try {
      new URL(url)
    } catch (err) {
      throw new Error('Invalid webhook URL')
    }

    const webhook = {
      id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      events,
      secret: secret || generateSecret(),
      description: description || '',
      active: true,
      createdAt: Date.now(),
      lastTriggered: null,
      successCount: 0,
      failureCount: 0,
    }

    webhooks.set(webhook.id, webhook)

    logger.info(`Webhook registered: ${webhook.id} for ${url}`)

    return webhook
  } catch (error) {
    logger.error('Error registering webhook:', error)
    throw error
  }
}

/**
 * Get all webhooks
 */
export const getAllWebhooks = () => {
  try {
    return Array.from(webhooks.values())
  } catch (error) {
    logger.error('Error getting webhooks:', error)
    throw error
  }
}

/**
 * Get webhook by ID
 */
export const getWebhookById = (id) => {
  try {
    const webhook = webhooks.get(id)
    if (!webhook) {
      throw new Error('Webhook not found')
    }
    return webhook
  } catch (error) {
    logger.error('Error getting webhook:', error)
    throw error
  }
}

/**
 * Update webhook
 */
export const updateWebhook = (id, updates) => {
  try {
    const webhook = webhooks.get(id)
    if (!webhook) {
      throw new Error('Webhook not found')
    }

    const updated = {
      ...webhook,
      ...updates,
      id: webhook.id, // Prevent ID change
      createdAt: webhook.createdAt, // Prevent timestamp change
    }

    webhooks.set(id, updated)

    logger.info(`Webhook updated: ${id}`)

    return updated
  } catch (error) {
    logger.error('Error updating webhook:', error)
    throw error
  }
}

/**
 * Delete webhook
 */
export const deleteWebhook = (id) => {
  try {
    const webhook = webhooks.get(id)
    if (!webhook) {
      throw new Error('Webhook not found')
    }

    webhooks.delete(id)

    logger.info(`Webhook deleted: ${id}`)

    return { success: true }
  } catch (error) {
    logger.error('Error deleting webhook:', error)
    throw error
  }
}

/**
 * Trigger webhooks for an event
 */
export const triggerWebhooks = async (eventType, payload) => {
  try {
    const activeWebhooks = Array.from(webhooks.values()).filter(
      (wh) => wh.active && wh.events.includes(eventType)
    )

    logger.info(
      `Triggering ${activeWebhooks.length} webhooks for event: ${eventType}`
    )

    const results = await Promise.allSettled(
      activeWebhooks.map((webhook) => deliverWebhook(webhook, eventType, payload))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    logger.info(
      `Webhook delivery complete: ${successful} successful, ${failed} failed`
    )

    return { successful, failed, total: activeWebhooks.length }
  } catch (error) {
    logger.error('Error triggering webhooks:', error)
    throw error
  }
}

/**
 * Deliver a webhook
 */
const deliverWebhook = async (webhook, eventType, payload) => {
  try {
    const webhookPayload = {
      event: eventType,
      timestamp: Date.now(),
      data: payload,
    }

    // Sign payload with secret
    const signature = generateSignature(webhookPayload, webhook.secret)

    const response = await axios.post(webhook.url, webhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'X-Webhook-Id': webhook.id,
      },
      timeout: 10000, // 10 second timeout
    })

    // Update webhook stats
    webhook.lastTriggered = Date.now()
    webhook.successCount++
    webhooks.set(webhook.id, webhook)

    logger.info(`Webhook delivered successfully: ${webhook.id} to ${webhook.url}`)

    return { success: true, status: response.status }
  } catch (error) {
    // Update failure count
    webhook.failureCount++
    webhooks.set(webhook.id, webhook)

    logger.error(`Webhook delivery failed: ${webhook.id} to ${webhook.url}`, error)

    throw error
  }
}

/**
 * Generate webhook secret
 */
const generateSecret = () => {
  return `whsec_${Math.random().toString(36).substr(2, 32)}`
}

/**
 * Generate HMAC signature for payload
 */
const generateSignature = (payload, secret) => {
  // Simplified signature (use crypto.createHmac in production)
  return Buffer.from(JSON.stringify(payload) + secret)
    .toString('base64')
    .substr(0, 32)
}

/**
 * Test webhook delivery
 */
export const testWebhook = async (id) => {
  try {
    const webhook = webhooks.get(id)
    if (!webhook) {
      throw new Error('Webhook not found')
    }

    const testPayload = {
      test: true,
      message: 'This is a test webhook delivery',
      timestamp: Date.now(),
    }

    await deliverWebhook(webhook, 'test', testPayload)

    return { success: true, message: 'Test webhook delivered successfully' }
  } catch (error) {
    logger.error('Error testing webhook:', error)
    throw error
  }
}

export default {
  registerWebhook,
  getAllWebhooks,
  getWebhookById,
  updateWebhook,
  deleteWebhook,
  triggerWebhooks,
  testWebhook,
}

