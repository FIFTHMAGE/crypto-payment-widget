export const formatAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const formatAmount = (amount: string, decimals: number = 18) =>
  (parseFloat(amount) / Math.pow(10, decimals)).toFixed(4);

export const formatTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleString();
