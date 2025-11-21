# Crypto Payment Backend

Backend API service for the crypto payment widget.

## Features

- Payment processing across multiple blockchain networks
- RESTful API with comprehensive validation
- Redis caching for performance
- PostgreSQL for data persistence
- JWT authentication
- Rate limiting and security middleware

## Tech Stack

- Node.js & TypeScript
- Express.js
- PostgreSQL
- Redis
- Ethers.js
- Zod (validation)

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure your environment variables.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## API Documentation

API documentation is available at `/api/docs` when running the server.

## License

MIT

