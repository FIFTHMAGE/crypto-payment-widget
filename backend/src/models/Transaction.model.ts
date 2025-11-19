export interface Transaction {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionModel {
  async create(data: Partial<Transaction>) {
    // Create logic
    return data;
  }

  async findById(id: string) {
    // Find logic
    return { id };
  }
}
