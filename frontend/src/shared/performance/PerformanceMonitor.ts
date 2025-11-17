/** PerformanceMonitor - Performance monitoring system */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startMeasure(label: string) {
    performance.mark(`${label}-start`);
  }
  
  endMeasure(label: string) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    const measure = performance.getEntriesByName(label)[0];
    const times = this.metrics.get(label) || [];
    times.push(measure.duration);
    this.metrics.set(label, times);
  }
  
  getMetrics(label: string) {
    const times = this.metrics.get(label) || [];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return { avg, min: Math.min(...times), max: Math.max(...times), count: times.length };
  }
}

