export class WebhookService {
  async sendWebhook(url: string, data: unknown) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Webhook failed:', error);
    }
  }
}
