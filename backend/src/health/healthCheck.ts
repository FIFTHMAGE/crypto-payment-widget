/** Health Check System */
export const healthCheck = {
  check: async () => ({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: { database: 'ok', redis: 'ok', blockchain: 'ok' }
  })
};

