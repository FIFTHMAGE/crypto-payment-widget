/**
 * Async utilities - Helper functions for async operations
 * @module utils
 */

export class AsyncUtil {
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.sleep(delay * Math.pow(2, i));
        }
      }
    }

    throw lastError!;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    );

    return Promise.race([promise, timeoutPromise]);
  }

  static async parallel<T>(promises: Promise<T>[], maxConcurrency: number = 5): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const [index, promise] of promises.entries()) {
      const p = promise.then((result) => {
        results[index] = result;
      });

      executing.push(p);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === p),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }
}

