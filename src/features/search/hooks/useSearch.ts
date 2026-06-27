import { useSearchStore } from '../../../shared/stores'

export function useSearch() {
  const {
    keyword,
    results,
    history,
    loading,
    error,
    setKeyword,
    search,
    addHistory,
    removeHistory,
    clearHistory
  } = useSearchStore()

  return {
    keyword,
    results,
    history,
    loading,
    error,
    setKeyword,
    search,
    addHistory,
    removeHistory,
    clearHistory
  }
}
