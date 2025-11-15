import { logger } from '../utils/logger.js'

class NotificationService {
  constructor() {
    this.notifications = []
  }

  async sendEmail(to, subject, body) {
    // Mock email sending (in production, use SendGrid, AWS SES, etc.)
    const notification = {
      id: this.notifications.length + 1,
      type: 'email',
      to,
      subject,
      body,
      status: 'sent',
      sentAt: new Date().toISOString(),
    }

    this.notifications.push(notification)
    logger.info(`Email sent to ${to}: ${subject}`)
    
    return notification
  }

  async sendSMS(to, message) {
    // Mock SMS sending (in production, use Twilio, AWS SNS, etc.)
    const notification = {
      id: this.notifications.length + 1,
      type: 'sms',
      to,
      message,
      status: 'sent',
      sentAt: new Date().toISOString(),
    }

    this.notifications.push(notification)
    logger.info(`SMS sent to ${to}`)
    
    return notification
  }

  async sendPushNotification(deviceToken, title, body) {
    // Mock push notification (in production, use FCM, APNs, etc.)
    const notification = {
      id: this.notifications.length + 1,
      type: 'push',
      deviceToken,
      title,
      body,
      status: 'sent',
      sentAt: new Date().toISOString(),
    }

    this.notifications.push(notification)
    logger.info(`Push notification sent: ${title}`)
    
    return notification
  }

  async notifyTransaction(transaction, eventType) {
    // Send notifications for transaction events
    const notifications = []

    switch (eventType) {
      case 'created':
        notifications.push(
          await this.sendEmail(
            'admin@example.com',
            'New Transaction',
            `Transaction ${transaction.txHash} created`
          )
        )
        break
      
      case 'confirmed':
        notifications.push(
          await this.sendEmail(
            'admin@example.com',
            'Transaction Confirmed',
            `Transaction ${transaction.txHash} confirmed`
          )
        )
        break
      
      case 'failed':
        notifications.push(
          await this.sendEmail(
            'admin@example.com',
            'Transaction Failed',
            `Transaction ${transaction.txHash} failed`
          )
        )
        break
    }

    return notifications
  }

  getHistory(type = null) {
    if (type) {
      return this.notifications.filter((n) => n.type === type)
    }
    return this.notifications
  }
}

export const notificationService = new NotificationService()

