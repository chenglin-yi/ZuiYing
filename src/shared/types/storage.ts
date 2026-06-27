export interface StorageData {
  searchHistory: string[]
  historyRecords: any[]
  favorites: any[]
  playProgress: Record<string, number>
  settings: Settings
}

export interface Settings {
  theme: 'light' | 'dark' | 'system'
  playSpeed: number
}

export const STORAGE_KEYS = {
  SEARCH_HISTORY: '@search_history',
  HISTORY_RECORDS: '@history_records',
  FAVORITES: '@favorites',
  PLAY_PROGRESS: '@play_progress',
  SETTINGS: '@settings'
} as const
