import { useState, useEffect, useCallback } from 'react'
import { useHistoryStore, useFavoriteStore } from '../../../shared/stores'
import { Movie, HistoryRecord } from '../../../shared/types/movie'

interface UseProfileResult {
  records: HistoryRecord[]
  favorites: Movie[]
  loading: boolean
  loadData: () => Promise<void>
  removeHistory: (id: string) => void
  removeFavorite: (id: string) => void
  clearHistory: () => void
  clearFavorites: () => void
}

export function useProfile(): UseProfileResult {
  const [loading, setLoading] = useState(false)

  const {
    records,
    loadRecords,
    removeRecord,
    clearAll: clearHistory
  } = useHistoryStore()

  const {
    favorites,
    loadFavorites,
    removeFavorite,
    clearAll: clearFavorites
  } = useFavoriteStore()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([loadRecords(), loadFavorites()])
    } finally {
      setLoading(false)
    }
  }, [loadRecords, loadFavorites])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    records,
    favorites,
    loading,
    loadData,
    removeHistory: removeRecord,
    removeFavorite,
    clearHistory,
    clearFavorites
  }
}
