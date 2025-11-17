/** Stress Testing Framework */
export const stressTest = async (endpoint: string, requests = 1000) => {
  const results = [];
  for (let i = 0; i < requests; i++) {
    const start = Date.now();
    await fetch(endpoint);
    results.push(Date.now() - start);
  }
  return { total: requests, avgTime: results.reduce((a, b) => a + b) / results.length };
};

