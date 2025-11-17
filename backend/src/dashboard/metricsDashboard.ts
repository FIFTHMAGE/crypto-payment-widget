/** Custom Metrics Dashboard */
export const getDashboardMetrics = () => ({
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  cpu: process.cpuUsage(),
  requests: { total: 1000, errors: 5, avgResponseTime: 150 }
});

