/** Proper Caching Strategies */
export const cacheStrategies = {
  static: { maxAge: 31536000, staleWhileRevalidate: 86400 },
  api: { maxAge: 300, staleIfError: 3600 },
  dynamic: { maxAge: 0, noCache: true }
};

