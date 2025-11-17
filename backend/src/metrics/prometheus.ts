/** Prometheus Metrics */
import { Counter, Histogram, Registry } from 'prom-client';
export const register = new Registry();
export const paymentCounter = new Counter({ name: 'payments_total', help: 'Total payments', registers: [register] });
export const paymentDuration = new Histogram({ name: 'payment_duration_seconds', help: 'Payment processing time', registers: [register] });

