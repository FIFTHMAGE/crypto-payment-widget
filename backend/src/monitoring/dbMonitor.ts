/** Database Monitoring */
import { pool } from '../database/connection';
export const monitorDatabase = async () => ({
  activeConnections: pool.totalCount,
  idleConnections: pool.idleCount,
  waitingRequests: pool.waitingCount,
  timestamp: Date.now()
});

