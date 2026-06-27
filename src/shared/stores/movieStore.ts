import { create } from 'zustand'
import { Movie, Category } from '../types/movie'
import { parserService } from '../services/parser'
import { movieService } from '../services/movieService'

interface MovieState {
  popularMovies: Movie[]
  popularTVs: Movie[]
  varietyShows: Movie[]
  animationShows: Movie[]
  topRatedMovies: Movie[]
  topRatedTVs: Movie[]
  topRatedAnimation: Movie[]
  categories: Category[]
  currentCategory: string
  loading: boolean
  error: string | null
  loadHome: () => Promise<void>
  fetchByCategory: (category: string) => Promise<void>
  fetchTopRated: (category: 'movie' | 'tv' | 'animation') => Promise<void>
  fetchPopularMovies: () => Promise<void>
  fetchPopularTVs: () => Promise<void>
  setCategory: (category: string) => void
  clearError: () => void
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'movie', name: '电影', type: 'movie' },
  { id: 'tv', name: '电视剧', type: 'tv' },
  { id: 'animation', name: '动漫', type: 'animation' }
]

export const useMovieStore = create<MovieState>((set, get) => ({
  popularMovies: [],
  popularTVs: [],
  varietyShows: [],
  animationShows: [],
  topRatedMovies: [],
  topRatedTVs: [],
  topRatedAnimation: [],
  categories: DEFAULT_CATEGORIES,
  currentCategory: 'movie',
  loading: false,
  error: null,

  loadHome: async () => {
    const { currentCategory, fetchByCategory } = get()
    // 首页列表要尽快返回；不再请求排行榜，避免无用失败
    await fetchByCategory(currentCategory)
  },

  // 根据分类获取数据（使用妖狐API）
  fetchByCategory: async (category: string) => {
    const state = get()
    // 检查是否已有缓存数据
    if (category === 'movie' && state.popularMovies.length > 0) {
      set({ currentCategory: category, loading: false })
      return
    }
    if (category === 'tv' && state.popularTVs.length > 0) {
      set({ currentCategory: category, loading: false })
      return
    }
    if (category === 'animation' && state.animationShows.length > 0) {
      set({ currentCategory: category, loading: false })
      return
    }

    set({ loading: true, error: null, currentCategory: category })
    
    try {
      let result: { success: boolean; data?: Movie[]; error: string } = { success: false, error: '' }
      
      switch (category) {
        case 'movie':
          result = await parserService.yaohuCategorySearchFallback('movie')
          if (result.success && result.data) {
            set({ popularMovies: result.data, loading: false })
          } else {
            set({ loading: false, error: result.error || '加载失败' })
          }
          break
        case 'tv':
          result = await parserService.yaohuCategorySearchFallback('tv')
          if (result.success && result.data) {
            set({ popularTVs: result.data, loading: false })
          } else {
            set({ loading: false, error: result.error || '加载失败' })
          }
          break
        case 'animation':
          result = await parserService.yaohuCategorySearchFallback('animation')
          if (result.success && result.data) {
            set({ animationShows: result.data, loading: false })
          } else {
            set({ loading: false, error: result.error || '加载失败' })
          }
          break
        default:
          set({ loading: false })
      }
    } catch (error) {
      console.error(`获取${category}失败:`, error)
      set({ loading: false, error: '加载失败' })
    }
  },

  // 获取排行榜数据
  fetchTopRated: async (category: 'movie' | 'tv' | 'animation') => {
    try {
      const result = await parserService.yaohuGetTopRatedFallback(category)
      if (result.success && result.data) {
        switch (category) {
          case 'movie':
            set({ topRatedMovies: result.data })
            break
          case 'tv':
            set({ topRatedTVs: result.data })
            break
          case 'animation':
            set({ topRatedAnimation: result.data })
            break
        }
      }
    } catch (error) {
      console.error(`获取${category}排行榜失败:`, error)
    }
  },

  setCategory: (category: string) => {
    get().fetchByCategory(category)
  },

  fetchPopularMovies: async () => {
    const result = await parserService.yaohuCategorySearchFallback('movie')
    if (result.success && result.data) {
      set({ popularMovies: result.data })
    }
  },

  fetchPopularTVs: async () => {
    const result = await parserService.yaohuCategorySearchFallback('tv')
    if (result.success && result.data) {
      set({ popularTVs: result.data })
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))
