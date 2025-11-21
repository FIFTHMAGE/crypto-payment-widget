# Crypto Payment Smart Contracts

Smart contracts for the crypto payment widget platform.

## Contracts

### Core Contracts

- **PaymentProcessor** - Main payment processing contract
- **Escrow** - Secure escrow service with dispute resolution
- **PaymentSplitter** - Split payments among multiple recipients
- **BatchOperations** - Efficient batch payment operations

### Feature Contracts

- **PaymentStreaming** - Continuous payment streaming
- **SubscriptionPayment** - Recurring subscription payments
- **MilestonePayment** - Project-based milestone payments

### Security Contracts

- **EnhancedAccessControl** - Advanced RBAC system
- **EnhancedCircuitBreaker** - Emergency pause mechanism
- **ContractRateLimiter** - Rate limiting protection
- **FlashLoanProtection** - Flash loan attack prevention
- **AntiMEVProtection** - MEV protection mechanisms

## Development

### Prerequisites

- Node.js >= 18
- Hardhat
- Foundry (optional, for advanced testing)

### Installation

```bash
npm install
```

### Compilation

```bash
npx hardhat compile
```

### Testing

```bash
npx hardhat test
```

### Deployment

```bash
npx hardhat run scripts/deploy.ts --network <network>
```

### Verification

```bash
npx hardhat run scripts/verify.ts --network <network>
```

## Security

All contracts have been designed with security best practices:
- Reentrancy protection
- Access control
- Circuit breakers
- Rate limiting
- Comprehensive testing

## License

MIT

