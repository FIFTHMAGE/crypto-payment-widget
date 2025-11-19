export interface Webhook {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WebhookModel {
  async create(data: Partial<Webhook>) {
    // Create logic
    return data;
  }

  async findById(id: string) {
    // Find logic
    return { id };
  }
}
