# Backend API

Express.js backend for the Crypto Payment Widget.

## Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### Log Transaction
- **POST** `/api/transactions`
- Logs a transaction to the backend
- Request body: `{ txHash, from, to, amount, value, timestamp }`

### Get All Transactions
- **GET** `/api/transactions?limit=50&offset=0`
- Returns paginated list of transactions

### Get Transaction by Hash
- **GET** `/api/transactions/:txHash`
- Returns a specific transaction

### Verify Transaction
- **POST** `/api/transactions/:txHash/verify`
- Verifies a transaction (mock implementation)

## Running

```bash
npm run dev
```

Server runs on port 5000 by default.

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Production Notes

- Replace in-memory storage with a database
- Add authentication/authorization
- Implement real transaction verification
- Add rate limiting
- Add logging and monitoring
- Add error tracking

