export class EthereumService {
  async getBalance(address: string) {
    return '1.0';
  }

  async sendTransaction(tx: any) {
    return { hash: '0x...' };
  }
}
