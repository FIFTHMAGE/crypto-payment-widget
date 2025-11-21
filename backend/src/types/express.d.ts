/**
 * Express type extensions
 * @module types
 */

import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
      apiKey?: string;
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: {
    id: string;
    role: string;
    [key: string]: any;
  };
}

export {};

