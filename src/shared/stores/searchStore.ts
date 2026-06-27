import { create } from 'zustand'
import { Movie } from '../types/movie'
import storage from '../utils/storage'
import { parserService } from '../services/parser'

const MAX_HISTORY = 10

interface SearchState {
  keyword: string
  results: Movie[]
  resultsQuery: string
  history: string[]
  loading: boolean
  error: string | null
  yaohuResults: { id: string; index: number; title: string }[]
  setKeyword: (keyword: string) => void
  loadSearchHistory: () => Promise<void>
  clearResults: () => void
  search: (keyword: string, recordHistory?: boolean) => Promise<void>
  addHistory: (keyword: string) => void
  removeHistory: (keyword: string) => void
  clearHistory: () => void
}

async function persistHistory(history: string[]) {
  await storage.setSearchHistory(history.slice(0, MAX_HISTORY))
}

export const useSearchStore = create<SearchState>((set, get) => ({
  keyword: '',
  results: [],
  resultsQuery: '',
  history: [],
  loading: false,
  error: null,
  yaohuResults: [],

  setKeyword: (keyword: string) => {
    set({ keyword })
  },

  loadSearchHistory: async () => {
    const loaded = await storage.getSearchHistory()
    set({ history: (loaded || []).slice(0, MAX_HISTORY) })
  },

  clearResults: () => {
    set({ results: [], resultsQuery: '', yaohuResults: [] })
  },

  search: async (keyword: string, recordHistory = false) => {
    const q = keyword.trim()
    if (!q) {
      set({ results: [], resultsQuery: '', keyword: '', loading: false, yaohuResults: [] })
      return
    }

    set({ loading: true, error: null, keyword: q })

    try {
      // 使用妖狐API搜索
      const result = await parserService.yaohuSearch(q)
      
      if (result.success && result.data && result.data.length > 0) {
        // 将妖狐结果转换为Movie格式用于显示
        const movies: Movie[] = result.data.map((item: any) => {
          // 根据 type 或 class 判断媒体类型
          const mediaType = item.type?.includes('电视剧') || item.class?.includes('剧') 
            ? 'tv' 
            : 'movie'
          
          return {
            id: String(item.index || item.id || Math.random()),
            title: item.title || item.name || '未知',
            poster_path: item.pic || '',
            backdrop_path: item.pic || '',
            overview: item.content || item.remarks || '点击选择此资源获取播放链接',
            vote_average: parseFloat(item.score) || (item.remarks ? 0 : 8.0),
            release_date: item.year || new Date().getFullYear().toString(),
            media_type: mediaType,
            genre_ids: [],
            area: item.area || '',
            type: item.type || '',
            class: item.class || '',
            update_time: item.update_time || '',
            remarks: item.remarks || ''
          }
        })
        
        console.log('搜索结果:', movies.length, '条')
        console.log('第一张图片:', movies[0]?.poster_path)
        
        set({ 
          results: movies, 
          yaohuResults: result.data,
          loading: false, 
          resultsQuery: q 
        })
      } else {
        set({ 
          results: [], 
          yaohuResults: [],
          loading: false, 
          resultsQuery: q,
          error: result.error || '未找到相关资源'
        })
      }

      if (recordHistory) {
        const currentHistory = get().history
        if (!currentHistory.includes(q)) {
          const newHistory = [q, ...currentHistory].slice(0, MAX_HISTORY)
          set({ history: newHistory })
          await persistHistory(newHistory)
        }
      }
    } catch (error) {
      console.error('搜索失败:', error)
      set({ error: '搜索失败', loading: false, resultsQuery: q, results: [] })
    }
  },

  addHistory: (keyword: string) => {
    const q = keyword.trim()
    if (!q) return
    const currentHistory = get().history
    if (currentHistory.includes(q)) return
    const newHistory = [q, ...currentHistory].slice(0, MAX_HISTORY)
    set({ history: newHistory })
    void persistHistory(newHistory)
  },

  removeHistory: (keyword: string) => {
    const currentHistory = get().history
    const newHistory = currentHistory.filter((h) => h !== keyword)
    set({ history: newHistory })
    void persistHistory(newHistory)
  },

  clearHistory: () => {
    set({ history: [] })
    void persistHistory([])
  }
}))
