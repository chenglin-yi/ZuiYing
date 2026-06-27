import { create } from 'zustand'
import { Settings } from '../types/storage'
import storage from '../utils/storage'

interface SettingsState {
  settings: Settings
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  theme: 'light',
  playSpeed: 1.0
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,

  loadSettings: async () => {
    const settings = await storage.getSettings()
    if (settings) {
      set({ settings: { ...defaultSettings, ...settings } })
    }
  },

  updateSettings: (newSettings: Partial<Settings>) => {
    const currentSettings = get().settings
    const updated = { ...currentSettings, ...newSettings }
    set({ settings: updated })
    storage.setSettings(updated)
  }
}))
