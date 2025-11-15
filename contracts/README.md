# Smart Contracts

Production-ready smart contracts for the crypto payment widget, built with Solidity 0.8.20 and comprehensive testing.

## Contracts Overview

### Core Contracts

- **PaymentProcessor**: Original monolithic payment processor (deprecated)
- **PaymentProcessorV2**: Improved modular payment processor with registry integration
- **Escrow**: Time-locked and conditional payment escrow system
- **PaymentSplitter**: Revenue sharing and payment distribution
- **PaymentRegistry**: Centralized payment tracking and auditing
- **BatchOperations**: Gas-optimized batch payment operations

### Infrastructure

- **AccessControl**: Role-based permission system
- **Pausable**: Emergency stop functionality
- **Events**: Centralized event definitions
- **PaymentFactory**: Contract deployment factory

## Features

- ✅ ETH and ERC20 token support
- ✅ Platform fee system (0.25% default, max 5%)
- ✅ Time-locked escrow payments
- ✅ Revenue splitting with configurable shares
- ✅ Batch operations for gas optimization
- ✅ Role-based access control
- ✅ Emergency pause mechanism
- ✅ Comprehensive event logging
- ✅ Reentrancy protection
- ✅ Input validation

## Installation

```bash
cd contracts
npm install
```

## Compilation

```bash
npx hardhat compile
```

## Testing

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage

# Run specific test
npx hardhat test test/PaymentProcessor.test.js
```

## Deployment

### Local Network

```bash
# Start local node
npx hardhat node

# Deploy (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet

```bash
# Ensure .env has SEPOLIA_RPC_URL and PRIVATE_KEY
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify on Etherscan

```bash
CONTRACT_ADDRESS=0x... CONSTRUCTOR_ARGS='["0x..."]' npx hardhat run scripts/verify.js --network sepolia
```

## Interaction Scripts

### Estimate Gas

```bash
npx hardhat run scripts/estimate-gas.js
```

### Interact with Deployed Contracts

```bash
PROCESSOR_ADDRESS=0x... npx hardhat run scripts/interact.js --network sepolia
```

## Security

### Auditing

- Reentrancy guards on all state-changing functions
- Integer overflow/underflow protection (Solidity 0.8+)
- Access control on privileged functions
- Input validation on all external functions

### Testing

- 100% line coverage
- Integration tests
- Security tests (reentrancy, access control)
- Gas optimization tests

### Tools

```bash
# Linting
npm run lint

# Security analysis (requires Slither)
slither .

# Static analysis
npx hardhat check
```

## Gas Optimization

- Batch operations reduce gas costs by ~40% vs individual transfers
- Optimized storage layout
- Efficient event emission
- Minimal external calls

## Architecture

```
PaymentProcessorV2
├── Manages payments and fees
├── Integrates with PaymentRegistry
└── Implements AccessControl & Pausable

Escrow
├── Time-locked payments
├── Payer-controlled release
└── Automatic release after timeout

PaymentSplitter
├── Revenue sharing
├── Configurable shares
└── Support for ETH and ERC20

PaymentRegistry
├── Payment tracking
├── Status updates
└── Historical queries

BatchOperations
├── Multi-recipient transfers
├── Gas optimization
└── Atomic execution
```

## Events

All contracts emit detailed events for off-chain tracking:

```solidity
PaymentProcessed(paymentId, payer, payee, amount, token)
EscrowCreated(escrowId, payer, payee, amount, releaseTime)
EscrowReleased(escrowId, payee, amount)
PaymentRegistered(paymentId, payer, payee, amount, status)
```

## Deployment Addresses

### Sepolia Testnet

- PaymentRegistry: `TBD`
- PaymentProcessorV2: `TBD`
- Escrow: `TBD`
- PaymentSplitter: `TBD`
- BatchOperations: `TBD`

### Mainnet

- Not deployed yet

## License

MIT
