import { describe, it, expect, vi } from '@jest/globals'
import { sendEmail, sendWebhook, sendSlackNotification } from '../notificationService.js'

describe('Notification Service', () => {
  it('should send email notifications', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test message',
    })
    expect(result.success).toBe(true)
  })

  it('should send webhook notifications', async () => {
    const result = await sendWebhook({
      url: 'https://example.com/webhook',
      data: { event: 'test' },
    })
    expect(result.success).toBe(true)
  })

  it('should send Slack notifications', async () => {
    const result = await sendSlackNotification({
      channel: '#general',
      message: 'Test',
    })
    expect(result.success).toBe(true)
  })
})

