export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue ?? null
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return defaultValue ?? null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },

  clear(): void {
    try {
      window.localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },
}

