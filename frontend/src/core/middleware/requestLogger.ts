/**
 * Request logging middleware
 * @module core/middleware/requestLogger
 */

export interface RequestLog {
  method: string;
  url: string;
  timestamp: number;
  duration?: number;
  status?: number;
  error?: Error;
}

const logs: RequestLog[] = [];

export function logRequest(log: RequestLog): void {
  logs.push(log);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${log.method} ${log.url} - ${log.status || 'pending'}`);
  }
}

export function getRequestLogs(): RequestLog[] {
  return [...logs];
}

export function clearRequestLogs(): void {
  logs.length = 0;
}

