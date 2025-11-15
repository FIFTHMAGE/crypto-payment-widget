# Crypto Payment Smart Contracts

Production-ready smart contracts for secure crypto payments with escrow, splitting, and batch operations.

## Contracts

### Core Contracts

- **PaymentProcessorV2** - Main payment processor with registry integration
- **Escrow** - Secure escrow service with dispute resolution
- **PaymentSplitter** - Payment splitting with configurable shares
- **BatchOperations** - Batch payments for gas optimization
- **PaymentRegistry** - Centralized payment tracking
- **PaymentFactory** - Factory for deploying payment contracts

### Utility Contracts

- **AccessControl** - Role-based access control
- **Pausable** - Emergency pause functionality
- **Events** - Centralized event library

## Features

- ✅ Direct ETH and ERC20 payments
- ✅ Time-locked escrow with arbiter support
- ✅ Payment splitting with custom shares
- ✅ Batch operations for multiple payments
- ✅ Dispute resolution system
- ✅ Platform fee mechanism (0.25% default)
- ✅ Role-based access control
- ✅ Emergency pause
- ✅ Gas optimized
- ✅ Fully tested

## Setup

```bash
npm install
```

## Compile

```bash
npm run compile
```

## Test

```bash
npm test
npm run test:coverage
```

## Deploy

### Local Network

```bash
# Start local node
npm run node

# Deploy (in another terminal)
npm run deploy:localhost
```

### Testnets

```bash
npm run deploy:sepolia
```

### Mainnet

```bash
npm run deploy:mainnet
```

## Gas Report

```bash
npm run gas-report
```

## Contract Addresses

After deployment, addresses are saved to `deployment-addresses.json`.

## Security

- Uses OpenZeppelin contracts for standards
- ReentrancyGuard on all state-changing functions
- Access control for admin functions
- Emergency pause functionality
- Gas optimizations enabled

## License

MIT

