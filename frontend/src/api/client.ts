export class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  async get(path: string) {
    return fetch(`${this.baseUrl}${path}`).then(r => r.json());
  }

  async post(path: string, data: any) {
    return fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json());
  }
}
