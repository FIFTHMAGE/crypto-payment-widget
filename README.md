# Crypto Payment Widget

A comprehensive cryptocurrency payment solution with smart contracts, backend services, and a modern frontend widget.

## Project Structure

```
crypto-payment-widget/
├── contracts/          # Smart contracts (Solidity)
├── backend/           # Node.js backend services
└── frontend/          # React frontend widget
```

## Features

### Smart Contracts
- Multiple payment types (direct, escrow, split, streaming, subscription, milestone)
- Advanced security features (reentrancy protection, access control, circuit breakers)
- Gas-optimized operations
- Comprehensive event emission
- Upgradeable architecture

### Backend Services
- RESTful API with full CRUD operations
- Webhook management and delivery
- Real-time transaction monitoring
- Analytics and reporting
- Fraud detection
- Multi-layer caching
- Rate limiting and security

### Frontend Widget
- Modern React UI with Tailwind CSS
- WalletConnect integration
- Multi-step payment flow
- Real-time transaction status
- Responsive design

## Quick Start

### Prerequisites
- Node.js >= 18
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd crypto-payment-widget

# Install contract dependencies
cd contracts
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

#### Smart Contracts
```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm test

# Start local node
npm run node

# Deploy to localhost
npm run deploy:localhost
```

#### Backend
```bash
cd backend

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

#### Frontend
```bash
cd frontend

# Start development server
npm run dev
```

## Testing

### Smart Contracts
```bash
cd contracts
npm test                    # Run all tests
npm run test:coverage      # Run with coverage
npm run test:gas          # Gas usage report
```

### Backend
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage     # Coverage report
```

### Frontend
```bash
cd frontend
npm test                    # Run tests
npm run test:coverage     # Coverage report
```

## Deployment

### Smart Contracts
```bash
cd contracts

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to mainnet
npm run deploy:mainnet

# Verify contracts
npm run verify:sepolia
npm run verify:mainnet
```

### Backend
```bash
cd backend

# Build for production
npm run build

# Start production server
npm start
```

### Frontend
```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

### Environment Variables

#### Backend (.env)
```
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
API_KEY=your-api-key
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_CHAIN_ID=1
VITE_CONTRACT_ADDRESS=0x...
```

## API Documentation

API documentation is available at `http://localhost:3000/api-docs` when running the backend in development mode.

## Security

- All smart contracts have been thoroughly tested
- Backend implements multiple security layers
- Regular security audits recommended
- Bug bounty program available

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Distributed under the MIT License.

## Support


For support, please open an issue or contact the development team.
#### CryptoPaymentProcessor
- **Type**: payment
- **Network**: Base Sepolia
- **Address**:   [`[0;34m[INFO][0m Deploying CryptoPaymentProcessor to Base Sepolia...
[1;33m[WARNING][0m Deployment failed or simulated.`](https://sepolia.basescan.org/address/[0;34m[INFO][0m Deploying CryptoPaymentProcessor to Base Sepolia...
[1;33m[WARNING][0m Deployment failed or simulated.)
- **Owners**: 
  - `0x21b805BBC4bfFA7769868BF7f488D77b71756d3E`
  - `0x748876944621F3908CECAfb8f1a4354257b3AADf`
- **Deployment Date**: 2025-11-25

## Architecture

This project follows a clean architecture pattern with the following layers:

### Layers
- **Presentation Layer**: API routes and controllers
- **Business Logic Layer**: Services and domain logic
- **Data Access Layer**: Repositories and database interactions
- **Infrastructure Layer**: External services and utilities

### Design Patterns
- Dependency Injection for loose coupling
- Repository pattern for data access
- Factory pattern for object creation
- Observer pattern for event handling

### Key Components
```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # Data access
├── models/         # Data structures
├── utils/          # Helper functions
└── middleware/     # Express middleware
```
## Architecture

This project follows a clean architecture pattern with the following layers:

### Layers
- **Presentation Layer**: API routes and controllers
- **Business Logic Layer**: Services and domain logic
- **Data Access Layer**: Repositories and database interactions
- **Infrastructure Layer**: External services and utilities

### Design Patterns
- Dependency Injection for loose coupling
- Repository pattern for data access
- Factory pattern for object creation
- Observer pattern for event handling

### Key Components
```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # Data access
├── models/         # Data structures
├── utils/          # Helper functions
└── middleware/     # Express middleware
```
## Architecture

This project follows a clean architecture pattern with the following layers:

### Layers
- **Presentation Layer**: API routes and controllers
- **Business Logic Layer**: Services and domain logic
- **Data Access Layer**: Repositories and database interactions
- **Infrastructure Layer**: External services and utilities

### Design Patterns
- Dependency Injection for loose coupling
- Repository pattern for data access
- Factory pattern for object creation
- Observer pattern for event handling

### Key Components
```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # Data access
├── models/         # Data structures
├── utils/          # Helper functions
└── middleware/     # Express middleware
```
## Architecture

This project follows a clean architecture pattern with the following layers:

### Layers
- **Presentation Layer**: API routes and controllers
- **Business Logic Layer**: Services and domain logic
- **Data Access Layer**: Repositories and database interactions
- **Infrastructure Layer**: External services and utilities

### Design Patterns
- Dependency Injection for loose coupling
- Repository pattern for data access
- Factory pattern for object creation
- Observer pattern for event handling

### Key Components
```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # Data access
├── models/         # Data structures
├── utils/          # Helper functions
└── middleware/     # Express middleware
```
## Architecture

This project follows a clean architecture pattern with the following layers:

### Layers
- **Presentation Layer**: API routes and controllers
- **Business Logic Layer**: Services and domain logic
- **Data Access Layer**: Repositories and database interactions
- **Infrastructure Layer**: External services and utilities

### Design Patterns
- Dependency Injection for loose coupling
- Repository pattern for data access
- Factory pattern for object creation
- Observer pattern for event handling

### Key Components
```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── repositories/   # Data access
├── models/         # Data structures
├── utils/          # Helper functions
└── middleware/     # Express middleware
```
#### CryptoPaymentProcessor
- **Type**: payment
- **Network**: Base Sepolia
- **Address**:   [`[0;34m[INFO][0m Deploying CryptoPaymentProcessor to Base Sepolia...
[0;34m[INFO][0m Sending deployment transaction (this may take 30-60 seconds)...
[1;33m[WARNING][0m Deployment timed out after 120 seconds. Continuing...`](https://sepolia.basescan.org/address/[0;34m[INFO][0m Deploying CryptoPaymentProcessor to Base Sepolia...
[0;34m[INFO][0m Sending deployment transaction (this may take 30-60 seconds)...
[1;33m[WARNING][0m Deployment timed out after 120 seconds. Continuing...)
- **Owners**: 
  - `0x21b805BBC4bfFA7769868BF7f488D77b71756d3E`
  - `0x748876944621F3908CECAfb8f1a4354257b3AADf`
- **Deployment Date**: 2025-11-25

## Testing Strategy

### Test Coverage
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Performance tests for scalability

### Running Tests
```bash
npm run test          # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests
npm run test:coverage # Coverage report
```

### Test Structure
- AAA pattern (Arrange, Act, Assert)
- Mocking external dependencies
- Test fixtures and factories
- Snapshot testing where appropriate
#### CryptoPaymentProcessor
- **Type**: payment
- **Network**: Base Sepolia
- **Address**:   [`[0;34m[INFO][0m Deploying CryptoPaymentProcessor to Base Sepolia...
[0;34m[INFO][0m Sending deployment transaction (this may take 30-60 seconds)...
[1;33m[WARNING][0m Deployment timed out after 120 seconds. Continuing...`](https://sepolia.basescan.org/address/[0;34m[INFO][0m Deploying CryptoPaymentProcessor to Base Sepolia...
[0;34m[INFO][0m Sending deployment transaction (this may take 30-60 seconds)...
[1;33m[WARNING][0m Deployment timed out after 120 seconds. Continuing...)
- **Owners**: 
  - `0x21b805BBC4bfFA7769868BF7f488D77b71756d3E`
  - `0x748876944621F3908CECAfb8f1a4354257b3AADf`
- **Deployment Date**: 2025-11-25

#### CryptoPaymentProcessor
- **Type**: payment
- **Network**: Base Sepolia
- **Address**:   [`[0;34m[INFO][0m Deploying CryptoPaymentProcessor to Base Sepolia...
[0;34m[INFO][0m Sending deployment transaction (this may take 30-60 seconds)...
[1;33m[WARNING][0m Deployment timed out after 120 seconds. Continuing...`](https://sepolia.basescan.org/address/[0;34m[INFO][0m Deploying CryptoPaymentProcessor to Base Sepolia...
[0;34m[INFO][0m Sending deployment transaction (this may take 30-60 seconds)...
[1;33m[WARNING][0m Deployment timed out after 120 seconds. Continuing...)
- **Owners**: 
  - `0x21b805BBC4bfFA7769868BF7f488D77b71756d3E`
  - `0x748876944621F3908CECAfb8f1a4354257b3AADf`
- **Deployment Date**: 2025-11-26

