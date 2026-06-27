import { useState, useEffect, useCallback } from 'react'

interface UseRequestOptions<T> {
  manual?: boolean
  defaultParams?: any[]
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useRequest<T>(
  service: (...args: any[]) => Promise<T>,
  options: UseRequestOptions<T> = {}
) {
  const { manual = false, defaultParams = [], onSuccess, onError } = options

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const run = useCallback(async (...params: any[]) => {
    setLoading(true)
    setError(null)
    try {
      const result = await service(...params)
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [service, onSuccess, onError])

  useEffect(() => {
    if (!manual && defaultParams.length > 0) {
      run(...defaultParams)
    }
  }, [])

  return {
    loading,
    data,
    error,
    run
  }
}
