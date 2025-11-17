/** Log Aggregation */
export class LogAggregator {
  private logs: any[] = [];
  
  collect(log: any) { this.logs.push({ ...log, timestamp: Date.now() }); }
  flush() { const batch = [...this.logs]; this.logs = []; return batch; }
  search(query: string) { return this.logs.filter(log => JSON.stringify(log).includes(query)); }
}
export const aggregator = new LogAggregator();

