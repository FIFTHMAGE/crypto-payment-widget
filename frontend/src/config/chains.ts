export const SUPPORTED_CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpc: process.env.NEXT_PUBLIC_ETH_RPC_URL,
    explorer: 'https://etherscan.io',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpc: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
    explorer: 'https://polygonscan.com',
  },
};
