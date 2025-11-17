/** PaymentService - Service layer with business logic */
import { PaymentRepository } from '../repositories/PaymentRepository';

export class PaymentService {
  private repo = new PaymentRepository();
  
  async processPayment(data: any) {
    // Business logic here
    return this.repo.create(data);
  }
  
  async getPayment(id: string) {
    return this.repo.findById(id);
  }
}

