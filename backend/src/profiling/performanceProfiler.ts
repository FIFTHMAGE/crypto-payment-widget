/** Performance Profiling */
export const profile = async (fn: Function, label: string) => {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  console.log(`Profile [${label}]: ${duration}ms`);
  return { result, duration };
};

