import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../types/storage'

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  },

  async getSearchHistory(): Promise<string[]> {
    return (await this.get<string[]>(STORAGE_KEYS.SEARCH_HISTORY)) || []
  },

  async setSearchHistory(history: string[]): Promise<void> {
    await this.set(STORAGE_KEYS.SEARCH_HISTORY, history)
  },

  async getHistoryRecords(): Promise<any[]> {
    return (await this.get<any[]>(STORAGE_KEYS.HISTORY_RECORDS)) || []
  },

  async setHistoryRecords(records: any[]): Promise<void> {
    await this.set(STORAGE_KEYS.HISTORY_RECORDS, records)
  },

  async getFavorites(): Promise<any[]> {
    return (await this.get<any[]>(STORAGE_KEYS.FAVORITES)) || []
  },

  async setFavorites(favorites: any[]): Promise<void> {
    await this.set(STORAGE_KEYS.FAVORITES, favorites)
  },

  async getPlayProgress(): Promise<Record<string, number>> {
    return (await this.get<Record<string, number>>(STORAGE_KEYS.PLAY_PROGRESS)) || {}
  },

  async setPlayProgress(progress: Record<string, number>): Promise<void> {
    await this.set(STORAGE_KEYS.PLAY_PROGRESS, progress)
  },

  async getPlayQueue<T>(): Promise<T | null> {
    return await this.get<T>(STORAGE_KEYS.PLAY_QUEUE)
  },

  async setPlayQueue<T>(queue: T): Promise<void> {
    await this.set(STORAGE_KEYS.PLAY_QUEUE, queue)
  },

  async getPlayQueueIndex(): Promise<number | null> {
    return await this.get<number>(STORAGE_KEYS.PLAY_QUEUE_INDEX)
  },

  async setPlayQueueIndex(index: number): Promise<void> {
    await this.set(STORAGE_KEYS.PLAY_QUEUE_INDEX, index)
  },

  async getSettings(): Promise<any> {
    return await this.get(STORAGE_KEYS.SETTINGS)
  },

  async setSettings(settings: any): Promise<void> {
    await this.set(STORAGE_KEYS.SETTINGS, settings)
  }
}

export default storage
