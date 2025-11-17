/** APM Integration (New Relic/DataDog) */
export const apm = {
  startTransaction: (name: string) => ({ name, startTime: Date.now() }),
  endTransaction: (transaction: any) => ({ ...transaction, duration: Date.now() - transaction.startTime }),
  recordMetric: (name: string, value: number) => console.log(`Metric ${name}: ${value}`),
  captureError: (error: Error) => console.error('APM Error:', error)
};

