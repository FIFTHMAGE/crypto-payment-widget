import logger from '../utils/logger.js'

/**
 * Analytics Service
 * Handles analytics calculations and reporting
 */

// In-memory storage for analytics (replace with Redis/DB in production)
const analyticsData = {
  transactions: [],
  users: new Set(),
  revenue: 0,
  volumes: {},
}

/**
 * Track a transaction for analytics
 */
export const trackTransaction = (transaction) => {
  try {
    analyticsData.transactions.push({
      ...transaction,
      timestamp: Date.now(),
    })

    // Track user
    if (transaction.from) {
      analyticsData.users.add(transaction.from.toLowerCase())
    }

    // Track volume
    const amount = parseFloat(transaction.amount || 0)
    if (!isNaN(amount)) {
      analyticsData.volumes[transaction.token || 'ETH'] =
        (analyticsData.volumes[transaction.token || 'ETH'] || 0) + amount
    }

    logger.info(`Transaction tracked for analytics: ${transaction.txHash}`)
  } catch (error) {
    logger.error('Error tracking transaction:', error)
  }
}

/**
 * Get transaction analytics
 */
export const getTransactionAnalytics = (timeRange = '24h') => {
  try {
    const now = Date.now()
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }

    const rangeMs = ranges[timeRange] || ranges['24h']
    const cutoff = now - rangeMs

    const relevantTxs = analyticsData.transactions.filter((tx) => tx.timestamp >= cutoff)

    return {
      totalTransactions: relevantTxs.length,
      successfulTransactions: relevantTxs.filter((tx) => tx.status === 'confirmed').length,
      failedTransactions: relevantTxs.filter((tx) => tx.status === 'failed').length,
      pendingTransactions: relevantTxs.filter((tx) => tx.status === 'pending').length,
      totalVolume: relevantTxs.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0),
        0
      ),
      averageTransactionValue:
        relevantTxs.length > 0
          ? relevantTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) /
            relevantTxs.length
          : 0,
      uniqueUsers: new Set(relevantTxs.map((tx) => tx.from.toLowerCase())).size,
      timeRange,
    }
  } catch (error) {
    logger.error('Error getting transaction analytics:', error)
    throw error
  }
}

/**
 * Get volume analytics by token
 */
export const getVolumeByToken = () => {
  try {
    return Object.entries(analyticsData.volumes).map(([token, volume]) => ({
      token,
      volume,
      percentage:
        (volume /
          Object.values(analyticsData.volumes).reduce((sum, v) => sum + v, 0)) *
        100,
    }))
  } catch (error) {
    logger.error('Error getting volume by token:', error)
    throw error
  }
}

/**
 * Get user activity analytics
 */
export const getUserAnalytics = () => {
  try {
    const userTransactions = {}

    analyticsData.transactions.forEach((tx) => {
      const user = tx.from.toLowerCase()
      if (!userTransactions[user]) {
        userTransactions[user] = {
          totalTransactions: 0,
          totalVolume: 0,
          firstTransaction: tx.timestamp,
          lastTransaction: tx.timestamp,
        }
      }

      userTransactions[user].totalTransactions++
      userTransactions[user].totalVolume += parseFloat(tx.amount || 0)
      userTransactions[user].lastTransaction = Math.max(
        userTransactions[user].lastTransaction,
        tx.timestamp
      )
    })

    return {
      totalUsers: analyticsData.users.size,
      activeUsers24h: Object.entries(userTransactions).filter(
        ([, data]) => Date.now() - data.lastTransaction < 24 * 60 * 60 * 1000
      ).length,
      topUsers: Object.entries(userTransactions)
        .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
        .slice(0, 10)
        .map(([address, data]) => ({ address, ...data })),
    }
  } catch (error) {
    logger.error('Error getting user analytics:', error)
    throw error
  }
}

/**
 * Get time-series data for charts
 */
export const getTimeSeriesData = (interval = 'hour', points = 24) => {
  try {
    const now = Date.now()
    const intervals = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    }

    const intervalMs = intervals[interval] || intervals['hour']
    const result = []

    for (let i = points - 1; i >= 0; i--) {
      const endTime = now - i * intervalMs
      const startTime = endTime - intervalMs

      const txsInInterval = analyticsData.transactions.filter(
        (tx) => tx.timestamp >= startTime && tx.timestamp < endTime
      )

      result.push({
        timestamp: endTime,
        transactionCount: txsInInterval.length,
        volume: txsInInterval.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0),
        averageValue:
          txsInInterval.length > 0
            ? txsInInterval.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) /
              txsInInterval.length
            : 0,
      })
    }

    return result
  } catch (error) {
    logger.error('Error getting time series data:', error)
    throw error
  }
}

/**
 * Get platform metrics
 */
export const getPlatformMetrics = () => {
  try {
    return {
      totalTransactions: analyticsData.transactions.length,
      totalUsers: analyticsData.users.size,
      totalVolume: analyticsData.transactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount || 0),
        0
      ),
      totalRevenue: analyticsData.revenue,
      volumeByToken: getVolumeByToken(),
      successRate:
        analyticsData.transactions.length > 0
          ? (analyticsData.transactions.filter((tx) => tx.status === 'confirmed').length /
              analyticsData.transactions.length) *
            100
          : 0,
    }
  } catch (error) {
    logger.error('Error getting platform metrics:', error)
    throw error
  }
}

export default {
  trackTransaction,
  getTransactionAnalytics,
  getVolumeByToken,
  getUserAnalytics,
  getTimeSeriesData,
  getPlatformMetrics,
}

