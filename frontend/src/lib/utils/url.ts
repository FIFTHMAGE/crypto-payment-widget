export function buildUrl(base: string, path: string, params?: Record<string, any>): string {
  const url = new URL(path, base)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  return url.toString()
}

export function getQueryParam(key: string): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get(key)
}

export function setQueryParam(key: string, value: string): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  params.set(key, value)
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
}

