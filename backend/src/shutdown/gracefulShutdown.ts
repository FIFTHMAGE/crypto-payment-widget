/** Graceful Shutdown */
export const setupGracefulShutdown = (server: any) => {
  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => { console.log('Server closed'); process.exit(0); });
    setTimeout(() => process.exit(1), 10000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

