import { create } from 'zustand'
import { QueueItem, Playlist } from '../types/movie'
import storage from '../utils/storage'

interface PlaylistState {
  currentQueue: QueueItem[]
  currentIndex: number
  savedPlaylists: Playlist[]

  loadQueue: () => Promise<void>
  setQueue: (items: QueueItem[], startIndex?: number) => void
  addToQueue: (items: QueueItem[]) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  moveToNext: () => QueueItem | null
  moveToIndex: (index: number) => QueueItem | null
  hasNext: () => boolean
  hasPrevious: () => boolean
  savePlaylist: (playlist: Playlist) => void
  deletePlaylist: (id: string) => void
}

const persistQueue = async (queue: QueueItem[], index: number) => {
  try {
    await storage.setPlayQueue(queue)
    await storage.setPlayQueueIndex(index)
  } catch (e) {
    console.error('保存播放队列失败:', e)
  }
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  currentQueue: [],
  currentIndex: 0,
  savedPlaylists: [],

  loadQueue: async () => {
    try {
      const queue = (await storage.getPlayQueue<QueueItem[]>()) || []
      const index = (await storage.getPlayQueueIndex()) || 0
      set({ currentQueue: queue, currentIndex: Math.max(0, Math.min(index, queue.length - 1)) })
    } catch (e) {
      console.error('加载播放队列失败:', e)
      set({ currentQueue: [], currentIndex: 0 })
    }
  },

  setQueue: (items: QueueItem[], startIndex = 0) => {
    const validIndex = Math.max(0, Math.min(startIndex, items.length - 1))
    set({ currentQueue: items, currentIndex: validIndex })
    persistQueue(items, validIndex)
  },

  addToQueue: (items: QueueItem[]) => {
    const state = get()
    const existingIds = new Set(state.currentQueue.map((i) => i.id))
    const newItems = items.filter((i) => !existingIds.has(i.id))
    const queue = [...state.currentQueue, ...newItems]
    set({ currentQueue: queue })
    persistQueue(queue, state.currentIndex)
  },

  removeFromQueue: (index: number) => {
    const state = get()
    if (index < 0 || index >= state.currentQueue.length) return

    const queue = state.currentQueue.filter((_, i) => i !== index)
    let newIndex = state.currentIndex
    if (index < state.currentIndex) {
      newIndex = Math.max(0, state.currentIndex - 1)
    } else if (index === state.currentIndex && queue.length > 0) {
      newIndex = Math.min(state.currentIndex, queue.length - 1)
    }
    set({ currentQueue: queue, currentIndex: newIndex })
    persistQueue(queue, newIndex)
  },

  clearQueue: () => {
    set({ currentQueue: [], currentIndex: 0 })
    persistQueue([], 0)
  },

  moveToNext: () => {
    const state = get()
    const nextIndex = state.currentIndex + 1
    if (nextIndex >= state.currentQueue.length) return null
    set({ currentIndex: nextIndex })
    persistQueue(state.currentQueue, nextIndex)
    return state.currentQueue[nextIndex]
  },

  moveToIndex: (index: number) => {
    const state = get()
    if (index < 0 || index >= state.currentQueue.length) return null
    set({ currentIndex: index })
    persistQueue(state.currentQueue, index)
    return state.currentQueue[index]
  },

  hasNext: () => {
    const state = get()
    return state.currentIndex < state.currentQueue.length - 1
  },

  hasPrevious: () => {
    const state = get()
    return state.currentIndex > 0
  },

  savePlaylist: (playlist: Playlist) => {
    const state = get()
    const exists = state.savedPlaylists.findIndex((p) => p.id === playlist.id)
    let saved: Playlist[]
    if (exists >= 0) {
      saved = state.savedPlaylists.map((p) => (p.id === playlist.id ? playlist : p))
    } else {
      saved = [playlist, ...state.savedPlaylists]
    }
    set({ savedPlaylists: saved })
  },

  deletePlaylist: (id: string) => {
    const state = get()
    set({ savedPlaylists: state.savedPlaylists.filter((p) => p.id !== id) })
  },
}))
