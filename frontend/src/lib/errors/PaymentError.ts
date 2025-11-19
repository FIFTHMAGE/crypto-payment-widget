export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class InsufficientFundsError extends PaymentError {
  constructor(required: string, available: string) {
    super(
      `Insufficient funds: required ${required}, available ${available}`,
      'INSUFFICIENT_FUNDS',
      { required, available }
    );
    this.name = 'InsufficientFundsError';
  }
}

export class TransactionFailedError extends PaymentError {
  constructor(txHash: string, reason?: string) {
    super(
      `Transaction failed: ${reason || 'Unknown error'}`,
      'TX_FAILED',
      { txHash, reason }
    );
    this.name = 'TransactionFailedError';
  }
}
