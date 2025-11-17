/** Error Tracking (Sentry) */
export const sentry = {
  init: (dsn: string) => console.log('Sentry initialized'),
  captureException: (error: Error, context?: any) => console.error('Sentry:', error.message, context),
  captureMessage: (message: string, level = 'info') => console.log(`Sentry [${level}]:`, message)
};

