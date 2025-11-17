/** CSRF Protection */
import { randomBytes } from 'crypto';
export const generateCSRFToken = () => randomBytes(32).toString('hex');
export const validateCSRFToken = (token: string, expected: string) => token === expected;

