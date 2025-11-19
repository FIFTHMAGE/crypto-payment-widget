export class TransactionMonitor {
  async monitorTransaction(txHash: string) {
    console.log('Monitoring transaction:', txHash);
    return { confirmations: 12 };
  }
}
