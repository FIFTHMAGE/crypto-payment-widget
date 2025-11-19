export class PaymentProcessor {
  async processPayment(data: { amount: string; recipient: string; token: string }) {
    console.log('Processing payment:', data);
    return { txHash: '0x123...', status: 'pending' };
  }

  async confirmPayment(txHash: string) {
    console.log('Confirming payment:', txHash);
    return { status: 'confirmed' };
  }
}
