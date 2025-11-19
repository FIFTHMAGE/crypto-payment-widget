export interface Payment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentModel {
  async create(data: Partial<Payment>) {
    // Create logic
    return data;
  }

  async findById(id: string) {
    // Find logic
    return { id };
  }
}
