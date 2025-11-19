export const getExplorerUrl = (txHash: string, chainId: number) => {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
  };
  return `${explorers[chainId]}/tx/${txHash}`;
};
