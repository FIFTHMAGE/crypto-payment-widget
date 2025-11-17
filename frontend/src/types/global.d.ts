/** Global TypeScript Types */
declare global {
  interface Window {
    ethereum?: any;
  }
}

export type Address = `0x${string}`;
export type ChainId = number;
export type PaymentStatus = 'pending' | 'completed' | 'failed';

