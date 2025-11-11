import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// In-memory transaction storage (in production, use a database)
const transactions = []

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Log transaction endpoint
app.post('/api/transactions', (req, res) => {
  try {
    const { txHash, from, to, amount, value, timestamp } = req.body

    // Validate required fields
    if (!txHash || !from || !to || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: txHash, from, to, amount',
      })
    }

    // Create transaction record
    const transaction = {
      id: transactions.length + 1,
      txHash,
      from,
      to,
      amount,
      value: value || '0x0',
      timestamp: timestamp || new Date().toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // Store transaction
    transactions.push(transaction)

    console.log('Transaction logged:', transaction)

    // In production, you might want to:
    // 1. Verify the transaction on-chain
    // 2. Store in a database
    // 3. Trigger webhooks
    // 4. Process off-ramp if needed
    // 5. Send confirmation emails

    res.status(201).json({
      success: true,
      transaction,
      message: 'Transaction logged successfully',
    })
  } catch (error) {
    console.error('Error logging transaction:', error)
    res.status(500).json({
      error: 'Failed to log transaction',
      message: error.message,
    })
  }
})

// Get all transactions
app.get('/api/transactions', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query

    const limitedTransactions = transactions
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .reverse()

    res.json({
      success: true,
      transactions: limitedTransactions,
      total: transactions.length,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({
      error: 'Failed to fetch transactions',
      message: error.message,
    })
  }
})

// Get transaction by hash
app.get('/api/transactions/:txHash', (req, res) => {
  try {
    const { txHash } = req.params

    const transaction = transactions.find((tx) => tx.txHash === txHash)

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
      })
    }

    res.json({
      success: true,
      transaction,
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    res.status(500).json({
      error: 'Failed to fetch transaction',
      message: error.message,
    })
  }
})

// Verify transaction endpoint (optional - for production)
app.post('/api/transactions/:txHash/verify', async (req, res) => {
  try {
    const { txHash } = req.params

    // In production, you would verify the transaction on-chain
    // using ethers.js or web3.js
    // For now, we'll just return a mock response

    const transaction = transactions.find((tx) => tx.txHash === txHash)

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
      })
    }

    // Mock verification (replace with actual on-chain verification)
    transaction.status = 'confirmed'
    transaction.verifiedAt = new Date().toISOString()

    res.json({
      success: true,
      transaction,
      verified: true,
    })
  } catch (error) {
    console.error('Error verifying transaction:', error)
    res.status(500).json({
      error: 'Failed to verify transaction',
      message: error.message,
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

