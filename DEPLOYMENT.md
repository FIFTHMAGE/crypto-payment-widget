# Smart Contract Deployment Guide

## Prerequisites

- Node.js 18+
- Hardhat installed
- Wallet with ETH for gas fees
- RPC URL for your target network

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**

Add to your `.env` file:
```env
# Deployment
PRIVATE_KEY=your-wallet-private-key-here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
ETHERSCAN_API_KEY=your-etherscan-api-key

# Contract Address (after deployment)
VITE_CONTRACT_ADDRESS=deployed-contract-address-here
```

## Deploy to Sepolia Testnet

1. **Get Sepolia ETH:**
   - Visit https://sepoliafaucet.com/
   - Get free test ETH

2. **Deploy the contract:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. **Copy the deployed contract address** and add it to `.env`:
```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

4. **Verify the contract on Etherscan:**
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "FEE_COLLECTOR_ADDRESS"
```

## Deploy to Mainnet

⚠️ **WARNING:** Deploying to mainnet costs real ETH. Make sure you've tested thoroughly on testnet first!

1. **Update hardhat.config.js** with mainnet RPC URL

2. **Deploy:**
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

3. **Verify:**
```bash
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "FEE_COLLECTOR_ADDRESS"
```

## Local Testing

1. **Start local Hardhat node:**
```bash
npx hardhat node
```

2. **Deploy to local network (in another terminal):**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Update `.env` with local contract address**

4. **Connect MetaMask to localhost:8545**

## Contract Features

### Direct Payment
- Process instant payments with 0.25% platform fee
- Supports ETH and ERC20 tokens
- Automatic fee collection

### Escrow Payment
- Time-locked payments
- Manual release by payer
- Refund capability
- Secure fund holding

### Split Payment
- Pay multiple recipients in one transaction
- Custom amounts per recipient
- Efficient gas usage

## Platform Fee

- Default: 0.25% (25 basis points)
- Maximum: 5%
- Adjustable by contract owner
- Collected automatically on each transaction

## Security Considerations

1. **Private Key Safety:**
   - Never commit `.env` to git
   - Use hardware wallet for mainnet
   - Consider multi-sig for contract ownership

2. **Testing:**
   - Test all functions on testnet first
   - Verify contract on Etherscan
   - Audit before mainnet deployment

3. **Contract Ownership:**
   - Owner can update platform fee
   - Owner can change fee collector
   - Consider transferring ownership to multi-sig

## Troubleshooting

### "Insufficient funds" error
- Make sure your wallet has enough ETH for gas fees
- Check you're on the correct network

### "Contract not deployed" error
- Verify the contract address in `.env`
- Make sure you're connected to the correct network

### Transaction fails
- Check gas price settings
- Verify recipient addresses are valid
- Ensure sufficient balance for payment + fees

## Next Steps

1. Deploy to testnet and test all features
2. Update frontend with contract address
3. Test the full payment flow
4. Deploy to mainnet when ready
5. Set up monitoring and alerts

## Useful Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Check contract size
npx hardhat size-contracts

# Clean artifacts
npx hardhat clean

# Get help
npx hardhat help
```

## Support

For issues or questions:
- Check Hardhat docs: https://hardhat.org/docs
- OpenZeppelin docs: https://docs.openzeppelin.com/
- Etherscan: https://etherscan.io/
