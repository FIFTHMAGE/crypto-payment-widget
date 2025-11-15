import { useState, useEffect, useCallback } from 'react'

interface AsyncState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): AsyncState<T> & { execute: () => Promise<void>; reset: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: immediate,
  })

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true })

    try {
      const data = await asyncFunction()
      setState({ data, error: null, loading: false })
    } catch (error) {
      setState({ data: null, error: error as Error, loading: false })
    }
  }, [asyncFunction])

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false })
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { ...state, execute, reset }
}

