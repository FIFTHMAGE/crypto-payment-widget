/** Webhook Retry with Exponential Backoff */
export const retryWebhook = async (url: string, data: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { method: 'POST', body: JSON.stringify(data) });
      if (response.ok) return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

