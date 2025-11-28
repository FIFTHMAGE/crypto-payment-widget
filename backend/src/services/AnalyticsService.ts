import { logger } from '../utils/logger';

/**
 * Analytics Service
 * Handles analytics calculations and reporting
 */

export interface Transaction {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  token?: string;
  status: 'pending' | 'confirmed' | 'failed';
  chainId?: number;
  timestamp?: number;
}

export interface TransactionAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
  uniqueUsers: number;
  timeRange: string;
}

export interface TokenVolume {
  token: string;
  volume: number;
  percentage: number;
}

export interface UserData {
  totalTransactions: number;
  totalVolume: number;
  firstTransaction: number;
  lastTransaction: number;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers24h: number;
  topUsers: Array<{ address: string } & UserData>;
}

export interface TimeSeriesPoint {
  timestamp: number;
  transactionCount: number;
  volume: number;
  averageValue: number;
}

export interface PlatformMetrics {
  totalTransactions: number;
  totalUsers: number;
  totalVolume: number;
  totalRevenue: number;
  volumeByToken: TokenVolume[];
  successRate: number;
}

// In-memory storage for analytics (use Redis/DB in production)
interface AnalyticsData {
  transactions: Array<Transaction & { timestamp: number }>;
  users: Set<string>;
  revenue: number;
  volumes: Record<string, number>;
}

const analyticsData: AnalyticsData = {
  transactions: [],
  users: new Set(),
  revenue: 0,
  volumes: {},
};

type TimeRange = '1h' | '24h' | '7d' | '30d';
type TimeInterval = 'hour' | 'day' | 'week';

const TIME_RANGES: Record<TimeRange, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const TIME_INTERVALS: Record<TimeInterval, number> = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Track a transaction for analytics
 */
export const trackTransaction = (transaction: Transaction): void => {
  try {
    analyticsData.transactions.push({
      ...transaction,
      timestamp: Date.now(),
    });

    if (transaction.from) {
      analyticsData.users.add(transaction.from.toLowerCase());
    }

    const amount = parseFloat(transaction.amount || '0');
    if (!isNaN(amount)) {
      const token = transaction.token || 'ETH';
      analyticsData.volumes[token] = (analyticsData.volumes[token] || 0) + amount;
    }

    logger.info(`Transaction tracked for analytics: ${transaction.txHash}`);
  } catch (error) {
    logger.error('Error tracking transaction:', error);
  }
};

/**
 * Get transaction analytics for a time range
 */
export const getTransactionAnalytics = async (
  timeRange: string = '24h'
): Promise<TransactionAnalytics> => {
  const now = Date.now();
  const rangeMs = TIME_RANGES[timeRange as TimeRange] || TIME_RANGES['24h'];
  const cutoff = now - rangeMs;

  const relevantTxs = analyticsData.transactions.filter((tx) => tx.timestamp >= cutoff);
  const totalVolume = relevantTxs.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

    return {
    totalTransactions: relevantTxs.length,
    successfulTransactions: relevantTxs.filter((tx) => tx.status === 'confirmed').length,
    failedTransactions: relevantTxs.filter((tx) => tx.status === 'failed').length,
    pendingTransactions: relevantTxs.filter((tx) => tx.status === 'pending').length,
    totalVolume,
    averageTransactionValue: relevantTxs.length > 0 ? totalVolume / relevantTxs.length : 0,
    uniqueUsers: new Set(relevantTxs.map((tx) => tx.from.toLowerCase())).size,
    timeRange,
  };
};

/**
 * Get volume analytics by token
 */
export const getVolumeByToken = async (): Promise<TokenVolume[]> => {
  const totalVolume = Object.values(analyticsData.volumes).reduce((sum, v) => sum + v, 0);

  return Object.entries(analyticsData.volumes).map(([token, volume]) => ({
          token,
    volume,
    percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0,
  }));
};

/**
 * Get user activity analytics
 */
export const getUserAnalytics = async (): Promise<UserAnalytics> => {
  const userTransactions: Record<string, UserData> = {};

  for (const tx of analyticsData.transactions) {
    const user = tx.from.toLowerCase();
    if (!userTransactions[user]) {
      userTransactions[user] = {
        totalTransactions: 0,
        totalVolume: 0,
        firstTransaction: tx.timestamp,
        lastTransaction: tx.timestamp,
      };
    }

    userTransactions[user].totalTransactions++;
    userTransactions[user].totalVolume += parseFloat(tx.amount || '0');
    userTransactions[user].lastTransaction = Math.max(
      userTransactions[user].lastTransaction,
      tx.timestamp
    );
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

    return {
    totalUsers: analyticsData.users.size,
    activeUsers24h: Object.values(userTransactions).filter(
      (data) => now - data.lastTransaction < dayMs
    ).length,
    topUsers: Object.entries(userTransactions)
      .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
      .slice(0, 10)
      .map(([address, data]) => ({ address, ...data })),
  };
};

/**
 * Get time-series data for charts
 */
export const getTimeSeriesData = async (
  interval: string = 'hour',
  points: number = 24
): Promise<TimeSeriesPoint[]> => {
  const now = Date.now();
  const intervalMs = TIME_INTERVALS[interval as TimeInterval] || TIME_INTERVALS.hour;
  const result: TimeSeriesPoint[] = [];

  for (let i = points - 1; i >= 0; i--) {
    const endTime = now - i * intervalMs;
    const startTime = endTime - intervalMs;

    const txsInInterval = analyticsData.transactions.filter(
      (tx) => tx.timestamp >= startTime && tx.timestamp < endTime
    );

    const volume = txsInInterval.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

    result.push({
      timestamp: endTime,
      transactionCount: txsInInterval.length,
      volume,
      averageValue: txsInInterval.length > 0 ? volume / txsInInterval.length : 0,
    });
  }

  return result;
};

/**
 * Get platform metrics
 */
export const getPlatformMetrics = async (): Promise<PlatformMetrics> => {
  const totalVolume = analyticsData.transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amount || '0'),
    0
  );

  const confirmedCount = analyticsData.transactions.filter(
    (tx) => tx.status === 'confirmed'
  ).length;

  return {
    totalTransactions: analyticsData.transactions.length,
    totalUsers: analyticsData.users.size,
    totalVolume,
    totalRevenue: analyticsData.revenue,
    volumeByToken: await getVolumeByToken(),
    successRate:
      analyticsData.transactions.length > 0
        ? (confirmedCount / analyticsData.transactions.length) * 100
        : 0,
  };
};

/**
 * Reset analytics data (for testing)
 */
export const resetAnalytics = (): void => {
  analyticsData.transactions = [];
  analyticsData.users.clear();
  analyticsData.revenue = 0;
  analyticsData.volumes = {};
};

export const analyticsService = {
  trackTransaction,
  getTransactionAnalytics,
  getVolumeByToken,
  getUserAnalytics,
  getTimeSeriesData,
  getPlatformMetrics,
  resetAnalytics,
};

export default analyticsService;
