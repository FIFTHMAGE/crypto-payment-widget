/** Read Replicas Support */
import { Pool } from 'pg';
export const readPool = new Pool({
  host: process.env.DB_READ_HOST || 'localhost',
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
export const readQuery = (sql: string, params?: any[]) => readPool.query(sql, params);

