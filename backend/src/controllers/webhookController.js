import { logger } from '../utils/logger.js'

// Webhook storage (in production, use database)
const webhooks = []
const webhookEvents = []

export const registerWebhook = async (req, res, next) => {
  try {
    const { url, events } = req.body

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Webhook URL is required',
      })
    }

    const webhook = {
      id: webhooks.length + 1,
      url,
      events: events || ['transaction.created', 'transaction.confirmed'],
      active: true,
      createdAt: new Date().toISOString(),
    }

    webhooks.push(webhook)
    logger.info(`Webhook registered: ${url}`)

    res.status(201).json({
      success: true,
      data: webhook,
    })
  } catch (error) {
    next(error)
  }
}

export const getWebhooks = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: webhooks,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteWebhook = async (req, res, next) => {
  try {
    const { id } = req.params
    const index = webhooks.findIndex((w) => w.id === parseInt(id))

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Webhook not found',
      })
    }

    webhooks.splice(index, 1)
    logger.info(`Webhook deleted: ${id}`)

    res.json({
      success: true,
      message: 'Webhook deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const triggerWebhook = async (eventType, data) => {
  const event = {
    id: webhookEvents.length + 1,
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  }

  webhookEvents.push(event)

  // Find matching webhooks
  const matchingWebhooks = webhooks.filter(
    (w) => w.active && w.events.includes(eventType)
  )

  // In production, send HTTP POST requests to webhook URLs
  matchingWebhooks.forEach((webhook) => {
    logger.info(`Webhook triggered: ${webhook.url} for event ${eventType}`)
    // fetch(webhook.url, { method: 'POST', body: JSON.stringify(event) })
  })

  return event
}

