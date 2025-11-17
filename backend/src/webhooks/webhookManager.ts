/** Webhook Management System */
export class WebhookManager {
  private webhooks = new Map<string, string[]>();
  
  subscribe(event: string, url: string) {
    const urls = this.webhooks.get(event) || [];
    urls.push(url);
    this.webhooks.set(event, urls);
  }
  
  async trigger(event: string, data: any) {
    const urls = this.webhooks.get(event) || [];
    return Promise.all(urls.map(url => 
      fetch(url, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })
    ));
  }
}

