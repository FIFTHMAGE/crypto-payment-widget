/**
 * Observer pattern implementation
 * @module core/patterns/observer
 */

export type Listener<T> = (data: T) => void;

export class EventEmitter<T> {
  private listeners: Set<Listener<T>> = new Set();

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(data: T): void {
    this.listeners.forEach((listener) => listener(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}

