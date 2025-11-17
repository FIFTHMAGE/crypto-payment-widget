/**
 * @title EnvValidator
 * @description Environment variable validation
 */

import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_CHAIN_ID: z.string().regex(/^\d+$/),
  VITE_WALLETCONNECT_PROJECT_ID: z.string().min(32),
  VITE_DEBUG: z.enum(['true', 'false']).optional(),
});

export const validateEnv = () => {
  try {
    envSchema.parse(import.meta.env);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path}: ${e.message}`),
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
};

