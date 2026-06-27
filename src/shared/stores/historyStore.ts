import { create } from 'zustand'
import { Movie, HistoryRecord } from '../types/movie'
import storage from '../utils/storage'

interface HistoryState {
  records: HistoryRecord[]
  loadRecords: () => Promise<void>
  addRecord: (movie: Movie, episode?: number) => void
  removeRecord: (id: string) => void
  /** 按影片 + 集数更新进度（与追剧记录中的 movieId、episode 一致） */
  updateProgress: (movieId: string, episode: number, progress: number, duration: number) => void
  clearAll: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  records: [],

  loadRecords: async () => {
    const records = await storage.getHistoryRecords()
    set({ records })
  },

  addRecord: (movie: Movie, episode: number = 1) => {
    const currentRecords = get().records
    const existingIndex = currentRecords.findIndex(r => r.movieId === movie.id)
    
    let newRecords: HistoryRecord[]
    
    if (existingIndex >= 0) {
      newRecords = currentRecords.map((r, i) => 
        i === existingIndex ? { ...r, updatedAt: Date.now(), episode } : r
      )
    } else {
      const newRecord: HistoryRecord = {
        id: `${movie.id}-${Date.now()}`,
        movieId: movie.id,
        movie,
        episode,
        progress: 0,
        duration: 0,
        updatedAt: Date.now()
      }
      newRecords = [newRecord, ...currentRecords].slice(0, 50)
    }
    
    set({ records: newRecords })
    storage.setHistoryRecords(newRecords)
  },

  removeRecord: (id: string) => {
    const currentRecords = get().records
    const newRecords = currentRecords.filter(r => r.id !== id)
    set({ records: newRecords })
    storage.setHistoryRecords(newRecords)
  },

  updateProgress: (movieId: string, episode: number, progress: number, duration: number) => {
    const currentRecords = get().records
    const newRecords = currentRecords.map((r) =>
      r.movieId === movieId && r.episode === episode
        ? { ...r, progress, duration, updatedAt: Date.now() }
        : r
    )
    set({ records: newRecords })
    storage.setHistoryRecords(newRecords)
  },

  clearAll: () => {
    set({ records: [] })
    storage.setHistoryRecords([])
  }
}))
