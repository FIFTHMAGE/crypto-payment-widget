export const isValidAddress = (address: string) =>
  /^0x[a-fA-F0-9]{40}$/.test(address);

export const isValidAmount = (amount: string) =>
  /^\d+(\.\d+)?$/.test(amount) && parseFloat(amount) > 0;
