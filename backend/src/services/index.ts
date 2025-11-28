/**
 * Services module - Central export for all services
 */

// Transaction service
export { transactionService } from './transactionService';
export type {
  Transaction,
  TransactionData,
  TransactionQuery,
  TransactionStatus,
  TransactionStats,
  PaginatedResult,
} from './transactionService';

// Cache service
export { cacheService } from './cacheService';
export type { CacheItem, CacheStats, CacheOptions } from './cacheService';

// Blockchain service
export { blockchainService } from './blockchainService';
export type {
  TransactionReceipt,
  TransactionLog,
  Balance,
  GasEstimate,
  TransactionVerification,
  TransactionInput,
  BlockInfo,
} from './blockchainService';

// Analytics service
export { analyticsService, trackTransaction } from './analyticsService';
export type {
  TransactionAnalytics,
  TokenVolume,
  UserData,
  UserAnalytics,
  TimeSeriesPoint,
  PlatformMetrics,
} from './analyticsService';

// Webhook service
export { webhookService } from './webhookService';
export type {
  Webhook,
  WebhookData,
  WebhookPayload,
  WebhookDeliveryResult,
  WebhookTriggerResult,
  WebhookEventType,
} from './webhookService';

// Notification service
export { notificationService } from './notificationService';
export type {
  Notification,
  EmailNotification,
  SMSNotification,
  PushNotification,
  NotificationType,
  NotificationStatus,
} from './notificationService';

// Re-export other services if they exist
export * from './PaymentService';

