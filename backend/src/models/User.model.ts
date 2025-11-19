export interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  async create(data: Partial<User>) {
    // Create logic
    return data;
  }

  async findById(id: string) {
    // Find logic
    return { id };
  }
}
