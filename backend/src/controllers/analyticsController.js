import { transactionService } from '../services/transactionService.js'

export const getAnalytics = async (req, res, next) => {
  try {
    const stats = await transactionService.getStats()
    
    // Calculate additional metrics
    const transactions = await transactionService.findAll({ limit: 1000 })
    
    const totalVolume = transactions.items.reduce((sum, tx) => {
      return sum + parseFloat(tx.amount || 0)
    }, 0)

    const avgTransaction = transactions.total > 0 
      ? totalVolume / transactions.total 
      : 0

    const analytics = {
      ...stats,
      totalVolume: totalVolume.toFixed(4),
      averageTransaction: avgTransaction.toFixed(4),
      successRate: stats.total > 0 
        ? ((stats.confirmed / stats.total) * 100).toFixed(2) 
        : 0,
    }

    res.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    next(error)
  }
}

export const getTransactionsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params
    const transactions = await transactionService.findAll({ limit: 1000 })
    
    const filtered = transactions.items.filter(tx => tx.status === status)

    res.json({
      success: true,
      data: {
        status,
        count: filtered.length,
        transactions: filtered,
      },
    })
  } catch (error) {
    next(error)
  }
}

