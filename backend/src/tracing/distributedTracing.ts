/** Distributed Tracing */
import { randomUUID } from 'crypto';
export const createSpan = (name: string, parentId?: string) => ({
  id: randomUUID(),
  name,
  parentId,
  startTime: Date.now(),
  tags: {}
});
export const endSpan = (span: any) => ({ ...span, endTime: Date.now(), duration: Date.now() - span.startTime });

