# Backend API

Production-ready backend for the crypto payment widget, built with Express.js and comprehensive testing.

## Features

- **RESTful API**: Clean, versioned API endpoints
- **Transaction Management**: Track and manage cryptocurrency transactions
- **Security**: Rate limiting, CORS, security headers, input validation
- **Caching**: In-memory caching with TTL support
- **Logging**: Winston-based structured logging
- **Error Handling**: Centralized error handling with proper status codes
- **Testing**: Comprehensive test suite with Jest and Supertest

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration modules
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── validators/       # Input validation schemas
│   └── server.js         # Application entry point
├── __tests__/            # Test files
└── package.json
```

## Installation

```bash
cd backend
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
REQUEST_TIMEOUT=30000
LOG_LEVEL=info
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## API Endpoints

### Health Check
```
GET /health
```

### Transactions
```
POST   /v1/transactions        # Log new transaction
GET    /v1/transactions        # List transactions (paginated)
GET    /v1/transactions/:hash  # Get specific transaction
PUT    /v1/transactions/:hash  # Update transaction status
```

### Analytics
```
GET /v1/analytics/stats        # Transaction statistics
GET /v1/analytics/volume       # Volume analytics
```

### System
```
GET /v1/system/metrics         # System metrics
GET /v1/system/version         # Version information
```

## Middleware

### Security
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Joi schemas

### Performance
- **Compression**: Response compression
- **Caching**: In-memory caching

### Monitoring
- **Request Logging**: Morgan + Winston
- **Error Handling**: Centralized error middleware

## Testing

### Unit Tests
Located in `src/**/__tests__/*.test.js`

### Integration Tests
Located in `src/__tests__/integration/*.test.js`

### Security Tests
Located in `src/__tests__/security/*.test.js`

### Performance Tests
Located in `src/__tests__/performance/*.test.js`

### Coverage Goals
- Unit Tests: > 80%
- Integration Tests: > 70%
- Overall: > 75%

## Deployment

### Docker
```bash
docker build -t payment-widget-backend .
docker run -p 5000:5000 payment-widget-backend
```

### PM2
```bash
pm2 start src/server.js --name payment-backend
```

## Monitoring

- Health checks at `/health`
- Metrics at `/v1/system/metrics`
- Structured logging with Winston
- Error tracking and alerting

## Contributing

1. Write tests for new features
2. Follow ESLint rules
3. Update documentation
4. Submit pull request

## License

MIT

