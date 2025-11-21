/**
 * Analytics Validation Schemas
 * Zod schemas for analytics-related requests
 */

import { z } from 'zod';
import { PaymentStatus } from '../types/payment';

/**
 * Get analytics summary schema
 */
export const getAnalyticsSummarySchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date'),
    currency: z.string().optional(),
    merchantId: z.string().uuid('Invalid merchant ID').optional(),
  }),
});

/**
 * Get payment analytics schema
 */
export const getPaymentAnalyticsSchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date'),
    groupBy: z.enum(['day', 'week', 'month', 'year']).optional().default('day'),
    currency: z.string().optional(),
    status: z.nativeEnum(PaymentStatus).optional(),
  }),
});

/**
 * Get revenue analytics schema
 */
export const getRevenueAnalyticsSchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date'),
    groupBy: z.enum(['day', 'week', 'month', 'year']).optional().default('day'),
    includeBreakdown: z
      .string()
      .optional()
      .transform((val) => val === 'true')
      .default('false'),
  }),
});

/**
 * Get user analytics schema
 */
export const getUserAnalyticsSchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date'),
    includeInactive: z
      .string()
      .optional()
      .transform((val) => val === 'true')
      .default('false'),
  }),
});

/**
 * Get conversion funnel schema
 */
export const getConversionFunnelSchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date'),
  }),
});

/**
 * Get top performers schema
 */
export const getTopPerformersSchema = z.object({
  query: z.object({
    metric: z.enum(['volume', 'count', 'frequency']).optional().default('volume'),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date'),
  }),
});

/**
 * Export analytics schema
 */
export const exportAnalyticsSchema = z.object({
  query: z.object({
    format: z.enum(['csv', 'json', 'pdf']).default('csv'),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid end date'),
    includeDetails: z
      .string()
      .optional()
      .transform((val) => val === 'true')
      .default('false'),
  }),
});

/**
 * Get cohort analysis schema
 */
export const getCohortAnalysisSchema = z.object({
  query: z.object({
    cohortType: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
    metric: z.enum(['retention', 'revenue', 'transactions']).default('retention'),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid start date'),
    periods: z
      .string()
      .optional()
      .default('12')
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 24, 'Periods must be between 1 and 24'),
  }),
});

