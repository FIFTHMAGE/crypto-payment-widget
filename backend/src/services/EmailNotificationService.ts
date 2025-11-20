/**
 * EmailNotificationService - Transactional email notifications
 * @module services/EmailNotification
 */

export enum EmailTemplate {
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_SENT = 'payment_sent',
  PAYMENT_FAILED = 'payment_failed',
  ESCROW_CREATED = 'escrow_created',
  ESCROW_RELEASED = 'escrow_released',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  SUBSCRIPTION_FAILED = 'subscription_failed',
  PAYMENT_DISPUTED = 'payment_disputed',
  WEEKLY_SUMMARY = 'weekly_summary',
}

export interface EmailRecipient {
  email: string;
  name?: string;
  address?: string;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export interface SendEmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  pending: string[];
}

export class EmailNotificationService {
  private readonly fromEmail = 'notifications@cryptopayment.com';
  private readonly fromName = 'Crypto Payment Widget';
  private emailQueue: Array<{
    to: EmailRecipient;
    template: EmailTemplate;
    data: any;
    scheduledFor?: number;
  }> = [];

  /**
   * Send payment received notification
   */
  async sendPaymentReceived(
    recipient: EmailRecipient,
    payment: {
      id: string;
      amount: string;
      token: string;
      from: string;
      transactionHash: string;
    }
  ): Promise<SendEmailResult> {
    const content = this.renderTemplate(EmailTemplate.PAYMENT_RECEIVED, {
      recipientName: recipient.name || 'User',
      amount: payment.amount,
      token: payment.token,
      from: this.formatAddress(payment.from),
      transactionHash: payment.transactionHash,
      explorerUrl: this.getExplorerUrl(payment.transactionHash),
    });

    return this.sendEmail(recipient, content);
  }

  /**
   * Send payment sent notification
   */
  async sendPaymentSent(
    recipient: EmailRecipient,
    payment: {
      id: string;
      amount: string;
      token: string;
      to: string;
      transactionHash: string;
    }
  ): Promise<SendEmailResult> {
    const content = this.renderTemplate(EmailTemplate.PAYMENT_SENT, {
      recipientName: recipient.name || 'User',
      amount: payment.amount,
      token: payment.token,
      to: this.formatAddress(payment.to),
      transactionHash: payment.transactionHash,
      explorerUrl: this.getExplorerUrl(payment.transactionHash),
    });

    return this.sendEmail(recipient, content);
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailed(
    recipient: EmailRecipient,
    payment: {
      id: string;
      amount: string;
      token: string;
      error: string;
    }
  ): Promise<SendEmailResult> {
    const content = this.renderTemplate(EmailTemplate.PAYMENT_FAILED, {
      recipientName: recipient.name || 'User',
      amount: payment.amount,
      token: payment.token,
      error: payment.error,
      supportEmail: 'support@cryptopayment.com',
    });

    return this.sendEmail(recipient, content);
  }

  /**
   * Send escrow notification
   */
  async sendEscrowCreated(
    recipient: EmailRecipient,
    escrow: {
      id: string;
      amount: string;
      token: string;
      releaseDate: Date;
    }
  ): Promise<SendEmailResult> {
    const content = this.renderTemplate(EmailTemplate.ESCROW_CREATED, {
      recipientName: recipient.name || 'User',
      amount: escrow.amount,
      token: escrow.token,
      releaseDate: escrow.releaseDate.toLocaleDateString(),
    });

    return this.sendEmail(recipient, content);
  }

  /**
   * Send weekly summary
   */
  async sendWeeklySummary(
    recipient: EmailRecipient,
    summary: {
      totalReceived: string;
      totalSent: string;
      transactionCount: number;
      topTokens: Array<{ token: string; amount: string }>;
    }
  ): Promise<SendEmailResult> {
    const content = this.renderTemplate(EmailTemplate.WEEKLY_SUMMARY, {
      recipientName: recipient.name || 'User',
      totalReceived: summary.totalReceived,
      totalSent: summary.totalSent,
      transactionCount: summary.transactionCount,
      topTokens: summary.topTokens,
    });

    return this.sendEmail(recipient, content);
  }

  /**
   * Send email with template
   */
  async sendTemplateEmail(
    recipient: EmailRecipient,
    template: EmailTemplate,
    data: Record<string, any>
  ): Promise<SendEmailResult> {
    const content = this.renderTemplate(template, data);
    return this.sendEmail(recipient, content);
  }

  /**
   * Send raw email
   */
  private async sendEmail(
    recipient: EmailRecipient,
    content: EmailContent
  ): Promise<SendEmailResult> {
    // This would integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email to:', recipient.email);
    console.log('Subject:', content.subject);

    // Mock result
    return {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      accepted: [recipient.email],
      rejected: [],
      pending: [],
    };
  }

  /**
   * Render email template
   */
  private renderTemplate(template: EmailTemplate, data: Record<string, any>): EmailContent {
    const templates: Record<EmailTemplate, (data: any) => EmailContent> = {
      [EmailTemplate.PAYMENT_RECEIVED]: (d) => ({
        subject: `Payment Received: ${d.amount} ${d.token}`,
        html: this.generatePaymentReceivedHTML(d),
        text: this.generatePaymentReceivedText(d),
      }),
      [EmailTemplate.PAYMENT_SENT]: (d) => ({
        subject: `Payment Sent: ${d.amount} ${d.token}`,
        html: this.generatePaymentSentHTML(d),
        text: this.generatePaymentSentText(d),
      }),
      [EmailTemplate.PAYMENT_FAILED]: (d) => ({
        subject: 'Payment Failed',
        html: this.generatePaymentFailedHTML(d),
        text: this.generatePaymentFailedText(d),
      }),
      [EmailTemplate.ESCROW_CREATED]: (d) => ({
        subject: `Escrow Created: ${d.amount} ${d.token}`,
        html: this.generateEscrowCreatedHTML(d),
        text: this.generateEscrowCreatedText(d),
      }),
      [EmailTemplate.ESCROW_RELEASED]: (d) => ({
        subject: `Escrow Released: ${d.amount} ${d.token}`,
        html: this.generateEscrowReleasedHTML(d),
        text: this.generateEscrowReleasedText(d),
      }),
      [EmailTemplate.SUBSCRIPTION_CREATED]: (d) => ({
        subject: 'Subscription Created',
        html: this.generateSubscriptionCreatedHTML(d),
        text: this.generateSubscriptionCreatedText(d),
      }),
      [EmailTemplate.SUBSCRIPTION_RENEWED]: (d) => ({
        subject: 'Subscription Renewed',
        html: this.generateSubscriptionRenewedHTML(d),
        text: this.generateSubscriptionRenewedText(d),
      }),
      [EmailTemplate.SUBSCRIPTION_FAILED]: (d) => ({
        subject: 'Subscription Payment Failed',
        html: this.generateSubscriptionFailedHTML(d),
        text: this.generateSubscriptionFailedText(d),
      }),
      [EmailTemplate.PAYMENT_DISPUTED]: (d) => ({
        subject: 'Payment Disputed',
        html: this.generatePaymentDisputedHTML(d),
        text: this.generatePaymentDisputedText(d),
      }),
      [EmailTemplate.WEEKLY_SUMMARY]: (d) => ({
        subject: 'Your Weekly Payment Summary',
        html: this.generateWeeklySummaryHTML(d),
        text: this.generateWeeklySummaryText(d),
      }),
    };

    return templates[template](data);
  }

  /**
   * Generate HTML for payment received
   */
  private generatePaymentReceivedHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .detail { margin: 10px 0; }
            .label { font-weight: bold; }
            .button { background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Received</h1>
            </div>
            <div class="content">
              <p>Hello ${data.recipientName},</p>
              <p>You have received a payment:</p>
              <div class="detail">
                <span class="label">Amount:</span> ${data.amount} ${data.token}
              </div>
              <div class="detail">
                <span class="label">From:</span> ${data.from}
              </div>
              <div class="detail">
                <span class="label">Transaction:</span> ${data.transactionHash}
              </div>
              <a href="${data.explorerUrl}" class="button">View Transaction</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate text for payment received
   */
  private generatePaymentReceivedText(data: any): string {
    return `
Payment Received

Hello ${data.recipientName},

You have received a payment:

Amount: ${data.amount} ${data.token}
From: ${data.from}
Transaction: ${data.transactionHash}

View transaction: ${data.explorerUrl}
    `.trim();
  }

  /**
   * Generate HTML for payment sent (simplified - would be similar structure)
   */
  private generatePaymentSentHTML(data: any): string {
    return `<html><body><h1>Payment Sent</h1><p>Amount: ${data.amount} ${data.token}</p></body></html>`;
  }

  private generatePaymentSentText(data: any): string {
    return `Payment Sent\n\nAmount: ${data.amount} ${data.token}`;
  }

  private generatePaymentFailedHTML(data: any): string {
    return `<html><body><h1>Payment Failed</h1><p>Error: ${data.error}</p></body></html>`;
  }

  private generatePaymentFailedText(data: any): string {
    return `Payment Failed\n\nError: ${data.error}`;
  }

  private generateEscrowCreatedHTML(data: any): string {
    return `<html><body><h1>Escrow Created</h1><p>Amount: ${data.amount} ${data.token}</p></body></html>`;
  }

  private generateEscrowCreatedText(data: any): string {
    return `Escrow Created\n\nAmount: ${data.amount} ${data.token}`;
  }

  private generateEscrowReleasedHTML(data: any): string {
    return `<html><body><h1>Escrow Released</h1><p>Amount: ${data.amount} ${data.token}</p></body></html>`;
  }

  private generateEscrowReleasedText(data: any): string {
    return `Escrow Released\n\nAmount: ${data.amount} ${data.token}`;
  }

  private generateSubscriptionCreatedHTML(data: any): string {
    return `<html><body><h1>Subscription Created</h1></body></html>`;
  }

  private generateSubscriptionCreatedText(data: any): string {
    return `Subscription Created`;
  }

  private generateSubscriptionRenewedHTML(data: any): string {
    return `<html><body><h1>Subscription Renewed</h1></body></html>`;
  }

  private generateSubscriptionRenewedText(data: any): string {
    return `Subscription Renewed`;
  }

  private generateSubscriptionFailedHTML(data: any): string {
    return `<html><body><h1>Subscription Failed</h1></body></html>`;
  }

  private generateSubscriptionFailedText(data: any): string {
    return `Subscription Payment Failed`;
  }

  private generatePaymentDisputedHTML(data: any): string {
    return `<html><body><h1>Payment Disputed</h1></body></html>`;
  }

  private generatePaymentDisputedText(data: any): string {
    return `Payment Disputed`;
  }

  private generateWeeklySummaryHTML(data: any): string {
    return `<html><body><h1>Weekly Summary</h1><p>Transactions: ${data.transactionCount}</p></body></html>`;
  }

  private generateWeeklySummaryText(data: any): string {
    return `Weekly Summary\n\nTransactions: ${data.transactionCount}`;
  }

  /**
   * Format address for display
   */
  private formatAddress(address: string): string {
    if (address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  /**
   * Get block explorer URL
   */
  private getExplorerUrl(txHash: string): string {
    return `https://etherscan.io/tx/${txHash}`;
  }

  /**
   * Schedule email for later
   */
  scheduleEmail(
    recipient: EmailRecipient,
    template: EmailTemplate,
    data: any,
    sendAt: Date
  ): void {
    this.emailQueue.push({
      to: recipient,
      template,
      data,
      scheduledFor: sendAt.getTime(),
    });
  }

  /**
   * Process email queue
   */
  async processQueue(): Promise<void> {
    const now = Date.now();
    const toSend = this.emailQueue.filter((item) => {
      return !item.scheduledFor || item.scheduledFor <= now;
    });

    for (const item of toSend) {
      await this.sendTemplateEmail(item.to, item.template, item.data);
    }

    // Remove sent items
    this.emailQueue = this.emailQueue.filter((item) => {
      return item.scheduledFor && item.scheduledFor > now;
    });
  }
}

export const emailNotificationService = new EmailNotificationService();

