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

  // 自动连播
  autoPlayNext: boolean
  autoPlayCountdownSeconds: number

  // 跳过片头片尾
  skipIntroOutro: boolean
  skipIntroEnd: number
  skipOutroSeconds: number
}

export const STORAGE_KEYS = {
  SEARCH_HISTORY: '@search_history',
  HISTORY_RECORDS: '@history_records',
  FAVORITES: '@favorites',
  PLAY_PROGRESS: '@play_progress',
  PLAY_QUEUE: '@play_queue',
  PLAY_QUEUE_INDEX: '@play_queue_index',
  SETTINGS: '@settings'
} as const
