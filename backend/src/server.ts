/**
 * Server entry point
 * @module server
 */

import app from './app';
import { env } from './config/environment';
import { Logger } from './utils/logger';
import { closeDatabaseConnections } from './config/database';

const logger = new Logger('Server');

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    await closeDatabaseConnections();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    logger.info('HTTP server closed');
    await closeDatabaseConnections();
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason: Error) => {
  logger.critical('Unhandled Rejection:', reason);
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  logger.critical('Uncaught Exception:', error);
  process.exit(1);
});
