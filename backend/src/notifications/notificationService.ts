/** Payment Notification Service */
export class NotificationService {
  async sendEmail(to: string, subject: string, body: string) {
    console.log(`Email to ${to}: ${subject}`);
  }
  
  async sendSMS(phone: string, message: string) {
    console.log(`SMS to ${phone}: ${message}`);
  }
  
  async notifyPayment(payment: any) {
    await this.sendEmail(payment.email, 'Payment Received', `Amount: ${payment.amount}`);
  }
}

