/** Logger - Proper logging with correlation IDs */
import { randomUUID } from 'crypto';
export class Logger {
  log(level: string, message: string, correlationId = randomUUID()) {
    console.log(JSON.stringify({ level, message, correlationId, timestamp: new Date().toISOString() }));
  }
  info(msg: string, id?: string) { this.log('INFO', msg, id); }
  error(msg: string, id?: string) { this.log('ERROR', msg, id); }
}
export const logger = new Logger();

