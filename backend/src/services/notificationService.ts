import { logger } from '../utils/logger';

/**
 * Notification Service
 * Handles sending emails, SMS, and push notifications
 */

export type NotificationType = 'email' | 'sms' | 'push' | 'webhook';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered';
export type TransactionEventType = 'created' | 'confirmed' | 'failed' | 'cancelled';

export interface BaseNotification {
  id: number;
  type: NotificationType;
  status: NotificationStatus;
  sentAt: string;
  deliveredAt?: string;
  error?: string;
}

export interface EmailNotification extends BaseNotification {
  type: 'email';
  to: string;
  subject: string;
  body: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
}

export interface SMSNotification extends BaseNotification {
  type: 'sms';
  to: string;
  message: string;
}

export interface PushNotification extends BaseNotification {
  type: 'push';
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export type Notification = EmailNotification | SMSNotification | PushNotification;

export interface NotificationOptions {
  priority?: 'high' | 'normal' | 'low';
  delay?: number;
  retry?: number;
}

export interface TransactionData {
  txHash: string;
  from?: string;
  to?: string;
  amount?: string;
  token?: string;
}

class NotificationService {
  private notifications: Notification[] = [];
  private nextId = 1;

  /**
   * Send an email notification
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    options?: { html?: string; cc?: string[]; bcc?: string[] }
  ): Promise<EmailNotification> {
    // Mock email sending (use SendGrid, AWS SES, etc. in production)
    const notification: EmailNotification = {
      id: this.nextId++,
      type: 'email',
      to,
      subject,
      body,
      html: options?.html,
      cc: options?.cc,
      bcc: options?.bcc,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };

    this.notifications.push(notification);
    logger.info(`Email sent to ${to}: ${subject}`);

    return notification;
  }

  /**
   * Send an SMS notification
   */
  async sendSMS(to: string, message: string): Promise<SMSNotification> {
    // Mock SMS sending (use Twilio, AWS SNS, etc. in production)
    const notification: SMSNotification = {
      id: this.nextId++,
      type: 'sms',
      to,
      message,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };

    this.notifications.push(notification);
    logger.info(`SMS sent to ${to}`);

    return notification;
  }

  /**
   * Send a push notification
   */
  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<PushNotification> {
    // Mock push notification (use FCM, APNs, etc. in production)
    const notification: PushNotification = {
      id: this.nextId++,
      type: 'push',
      deviceToken,
      title,
      body,
      data,
      status: 'sent',
      sentAt: new Date().toISOString(),
    };

    this.notifications.push(notification);
    logger.info(`Push notification sent: ${title}`);

    return notification;
  }

  /**
   * Notify about a transaction event
   */
  async notifyTransaction(
    transaction: TransactionData,
    eventType: TransactionEventType
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    const eventMessages: Record<TransactionEventType, { subject: string; body: string }> = {
      created: {
        subject: 'New Transaction',
        body: `Transaction ${transaction.txHash} created. Amount: ${transaction.amount || 'N/A'} ${transaction.token || 'ETH'}`,
      },
      confirmed: {
        subject: 'Transaction Confirmed',
        body: `Transaction ${transaction.txHash} has been confirmed on the blockchain.`,
      },
      failed: {
        subject: 'Transaction Failed',
        body: `Transaction ${transaction.txHash} has failed. Please check the details.`,
      },
      cancelled: {
        subject: 'Transaction Cancelled',
        body: `Transaction ${transaction.txHash} has been cancelled.`,
      },
    };

    const message = eventMessages[eventType];
    if (message) {
      notifications.push(await this.sendEmail(adminEmail, message.subject, message.body));
    }

    return notifications;
  }

  /**
   * Send a batch of notifications
   */
  async sendBatch(
    recipients: string[],
    type: 'email' | 'sms',
    content: { subject?: string; body: string }
  ): Promise<Notification[]> {
    const results: Notification[] = [];

    for (const recipient of recipients) {
      if (type === 'email' && content.subject) {
        results.push(await this.sendEmail(recipient, content.subject, content.body));
      } else if (type === 'sms') {
        results.push(await this.sendSMS(recipient, content.body));
      }
    }

    return results;
  }

  /**
   * Get notification history
   */
  getHistory(type?: NotificationType): Notification[] {
    if (type) {
      return this.notifications.filter((n) => n.type === type);
    }
    return this.notifications;
  }

  /**
   * Get notification by ID
   */
  getById(id: number): Notification | undefined {
    return this.notifications.find((n) => n.id === id);
  }

  /**
   * Get notification statistics
   */
  getStats(): {
    total: number;
    byType: Record<NotificationType, number>;
    byStatus: Record<NotificationStatus, number>;
  } {
    const byType: Record<NotificationType, number> = {
      email: 0,
      sms: 0,
      push: 0,
      webhook: 0,
    };

    const byStatus: Record<NotificationStatus, number> = {
      pending: 0,
      sent: 0,
      failed: 0,
      delivered: 0,
    };

    for (const notification of this.notifications) {
      byType[notification.type]++;
      byStatus[notification.status]++;
    }

    return {
      total: this.notifications.length,
      byType,
      byStatus,
    };
  }

  /**
   * Clear notification history (for testing)
   */
  clear(): void {
    this.notifications = [];
    this.nextId = 1;
    logger.info('Notification history cleared');
  }
}

export const notificationService = new NotificationService();

export default notificationService;

