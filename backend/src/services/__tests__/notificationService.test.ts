import { beforeEach, describe, expect, it } from 'vitest';

import { notificationService } from '../notificationService';

describe('Notification Service', () => {
  beforeEach(() => {
    // Clear notification history before each test
    notificationService.clear();
  });

  describe('sendEmail', () => {
    it('should send email notification', async () => {
      const result = await notificationService.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test message body'
      );

      expect(result.type).toBe('email');
      expect(result.to).toBe('test@example.com');
      expect(result.subject).toBe('Test Subject');
      expect(result.body).toBe('Test message body');
      expect(result.status).toBe('sent');
      expect(result.id).toBeDefined();
      expect(result.sentAt).toBeDefined();
    });

    it('should support HTML content', async () => {
      const result = await notificationService.sendEmail(
        'test@example.com',
        'HTML Email',
        'Plain text',
        { html: '<h1>HTML Content</h1>' }
      );

      expect(result.html).toBe('<h1>HTML Content</h1>');
    });

    it('should support CC and BCC', async () => {
      const result = await notificationService.sendEmail(
        'test@example.com',
        'CC/BCC Email',
        'Test',
        { cc: ['cc@example.com'], bcc: ['bcc@example.com'] }
      );

      expect(result.cc).toContain('cc@example.com');
      expect(result.bcc).toContain('bcc@example.com');
    });
  });

  describe('sendSMS', () => {
    it('should send SMS notification', async () => {
      const result = await notificationService.sendSMS(
        '+1234567890',
        'Test SMS message'
      );

      expect(result.type).toBe('sms');
      expect(result.to).toBe('+1234567890');
      expect(result.message).toBe('Test SMS message');
      expect(result.status).toBe('sent');
    });
  });

  describe('sendPushNotification', () => {
    it('should send push notification', async () => {
      const result = await notificationService.sendPushNotification(
        'device-token-123',
        'Push Title',
        'Push body content'
      );

      expect(result.type).toBe('push');
      expect(result.deviceToken).toBe('device-token-123');
      expect(result.title).toBe('Push Title');
      expect(result.body).toBe('Push body content');
      expect(result.status).toBe('sent');
    });

    it('should support custom data payload', async () => {
      const result = await notificationService.sendPushNotification(
        'device-token-123',
        'Push Title',
        'Push body',
        { action: 'open_tx', txHash: '0x123' }
      );

      expect(result.data).toEqual({
        action: 'open_tx',
        txHash: '0x123',
      });
    });
  });

  describe('notifyTransaction', () => {
    it('should send notification for created transaction', async () => {
      const results = await notificationService.notifyTransaction(
        { txHash: '0x123', amount: '1.0', token: 'ETH' },
        'created'
      );

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('email');
    });

    it('should send notification for confirmed transaction', async () => {
      const results = await notificationService.notifyTransaction(
        { txHash: '0x123' },
        'confirmed'
      );

      expect(results).toHaveLength(1);
    });

    it('should send notification for failed transaction', async () => {
      const results = await notificationService.notifyTransaction(
        { txHash: '0x123' },
        'failed'
      );

      expect(results).toHaveLength(1);
    });
  });

  describe('sendBatch', () => {
    it('should send batch email notifications', async () => {
      const results = await notificationService.sendBatch(
        ['user1@example.com', 'user2@example.com', 'user3@example.com'],
        'email',
        { subject: 'Batch Email', body: 'Batch content' }
      );

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.type).toBe('email');
      });
    });

    it('should send batch SMS notifications', async () => {
      const results = await notificationService.sendBatch(
        ['+1111111111', '+2222222222'],
        'sms',
        { body: 'Batch SMS' }
      );

      expect(results).toHaveLength(2);
      results.forEach((result) => {
        expect(result.type).toBe('sms');
      });
    });
  });

  describe('getHistory', () => {
    it('should return all notifications', async () => {
      await notificationService.sendEmail('test@example.com', 'Test 1', 'Body 1');
      await notificationService.sendSMS('+1234567890', 'Test SMS');
      await notificationService.sendPushNotification('token', 'Push', 'Body');

      const history = notificationService.getHistory();

      expect(history).toHaveLength(3);
    });

    it('should filter by type', async () => {
      await notificationService.sendEmail('test@example.com', 'Test 1', 'Body 1');
      await notificationService.sendSMS('+1234567890', 'Test SMS');

      const emailHistory = notificationService.getHistory('email');

      expect(emailHistory).toHaveLength(1);
      expect(emailHistory[0].type).toBe('email');
    });
  });

  describe('getStats', () => {
    it('should return notification statistics', async () => {
      await notificationService.sendEmail('test@example.com', 'Test', 'Body');
      await notificationService.sendSMS('+1234567890', 'SMS');
      await notificationService.sendPushNotification('token', 'Push', 'Body');

      const stats = notificationService.getStats();

      expect(stats.total).toBe(3);
      expect(stats.byType.email).toBe(1);
      expect(stats.byType.sms).toBe(1);
      expect(stats.byType.push).toBe(1);
      expect(stats.byStatus.sent).toBe(3);
    });
  });
});

