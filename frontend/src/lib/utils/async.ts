export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    delay?: number
    backoff?: number
  } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2 } = options

  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }

    await wait(delay)
    return retry(fn, {
      retries: retries - 1,
      delay: delay * backoff,
      backoff,
    })
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function promiseTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: Error = new Error('Promise timeout')
): Promise<T> {
  return Promise.race([
    promise,
    wait(timeoutMs).then(() => {
      throw timeoutError
    }),
  ])
}

