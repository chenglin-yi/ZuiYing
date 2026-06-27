import { create } from 'zustand'
import { Movie } from '../types/movie'
import storage from '../utils/storage'

interface FavoriteState {
  favorites: Movie[]
  loadFavorites: () => Promise<void>
  addFavorite: (movie: Movie) => void
  removeFavorite: (id: string) => boolean
  isFavorite: (id: string) => boolean
  clearAll: () => void
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],

  loadFavorites: async () => {
    const favorites = await storage.getFavorites()
    set({ favorites })
  },

  addFavorite: (movie: Movie) => {
    const currentFavorites = get().favorites
    if (currentFavorites.some(f => f.id === movie.id)) {
      return
    }
    
    const newFavorites = [...currentFavorites, movie].slice(0, 100)
    set({ favorites: newFavorites })
    storage.setFavorites(newFavorites)
  },

  removeFavorite: (id: string) => {
    const currentFavorites = get().favorites
    const newFavorites = currentFavorites.filter(f => f.id !== id)
    set({ favorites: newFavorites })
    storage.setFavorites(newFavorites)
    return true
  },

  isFavorite: (id: string) => {
    return get().favorites.some(f => f.id === id)
  },

  clearAll: () => {
    set({ favorites: [] })
    storage.setFavorites([])
  }
}))
