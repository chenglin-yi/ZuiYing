import { PlaySource, Movie } from '../types/movie'
import { API_CONFIG } from '../../config/api'
import { tmdbService } from './tmdb'
import { getImageUrl } from './apiClient'

interface WMDBMovie {
  originalName: string
  year: string
  type: string
  doubanId: string
  doubanRating: string
  doubanVotes: number
  duration: number
  episodes: number
  totalSeasons: number
  dateReleased: string
  data: Array<{
    poster: string
    name: string
    genre: string
    description: string
    country: string
  }>
  actor: Array<{ data: Array<{ name: string }> }>
  director: Array<{ data: Array<{ name: string }> }>
}

export interface SearchResult {
  success: boolean
  data?: any[]
  error: string
}

export interface YaohuMovie {
  id: string
  index: number
  title: string
  pic: string
  year: string
  area: string
  type: string
  content: string
  remarks: string
}

async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    return response
  } finally {
    clearTimeout(timer)
  }
}

// 解析JSON格式的搜索结果
function parseJsonResult(json: any): YaohuMovie[] {
  const list = json?.data?.list || []
  console.log('JSON解析到:', list.length, '条数据')
  
  return list.map((item: any) => ({
    id: String(item.id || ''),
    index: item.n || 0,
    title: item.name || '',
    pic: item.pic || '',
    year: item.year || '',
    area: item.area || '',
    type: item.type || '',
    content: item.content || item.blurb || '',
    remarks: item.remarks || ''
  }))
}

export const parserService = {
  // 妖狐影视搜索（返回JSON格式）
  async yaohuSearch(keyword: string): Promise<SearchResult> {
    try {
      // 不需要type参数，默认返回JSON
      const url = `${API_CONFIG.YAOHU_BASE_URL}/yingshi?key=${API_CONFIG.YAOHU_API_KEY}&msg=${encodeURIComponent(keyword)}`
      console.log('搜索URL:', url)
      
      const response = await fetchWithTimeout(url, 10000)
      const text = await response.text()
      
      // 尝试解析JSON
      try {
        const json = JSON.parse(text)
        console.log('JSON返回code:', json.code)
        
        if (json.code === 200 && json.data?.list) {
          const movies = parseJsonResult(json)
          console.log('解析成功:', movies.length, '条')
          return { success: true, data: movies, error: '' }
        } else {
          return { success: false, error: json.msg || '搜索失败' }
        }
      } catch (parseError) {
        console.error('JSON解析失败:', parseError)
        return { success: false, error: '解析失败' }
      }
    } catch (error) {
      console.error('搜索失败:', error)
      return { success: false, error: '网络错误' }
    }
  },

  // 获取播放链接（根据ID和序号）
  async getPlayUrlById(id: string, index: number, movieName?: string, quality?: string): Promise<{ url: string; name: string }> {
    try {
      // 需要同时传id和n才能获取播放链接
      let url = `${API_CONFIG.YAOHU_BASE_URL}/yingshi?key=${API_CONFIG.YAOHU_API_KEY}&msg=${encodeURIComponent(movieName || '')}&id=${id}&n=${index}`
      if (quality) {
        url += `&quality=${quality}`
      }
      console.log('获取播放链接:', url)
      
      const response = await fetchWithTimeout(url, 15000)
      const text = await response.text()
      console.log('播放链接返回:', text.substring(0, 300))
      
      // 尝试解析JSON
      try {
        const json = JSON.parse(text)
        if (json.code === 200 && json.data) {
          // 检查是否有episodes字段
          if (json.data.episodes && Array.isArray(json.data.episodes)) {
            // 查找对应索引的剧集
            const episode = json.data.episodes.find((ep: any) => {
              // 从标题中提取集数，如"第01集" -> 1
              const epNum = parseInt(ep.title.match(/第(\d+)集/)?.[1] || '0')
              return epNum === index
            })
            
            if (episode) {
              // 优先使用url，m3u8url作为备用
              const playUrl = episode.url || episode.m3u8url || ''
              return { url: playUrl, name: episode.title || '播放链接' }
            }
          }
          
          // 兼容旧的返回格式
          if (json.data.list?.[0]) {
            const item = json.data.list[0]
            // 优先使用url，notes作为备用
            const playUrl = item.url || item.notes || ''
            return { url: playUrl, name: item.name || '播放链接' }
          }
        }
      } catch (e) {
        console.error('JSON解析失败:', e)
      }
      
      // 尝试提取m3u8链接
      const m3u8Match = text.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/)
      if (m3u8Match) {
        return { url: m3u8Match[0], name: '播放链接' }
      }
      
      return { url: text, name: '播放链接' }
    } catch (error) {
      console.error('获取播放链接失败:', error)
      return { url: '', name: '' }
    }
  },

  // 兼容旧的接口名
  async getPlayUrlByIndex(keyword: string, index: number): Promise<{ url: string; name: string }> {
    return this.getPlayUrlById('', index, keyword)
  },

  // 获取播放源列表
  async getPlaySources(movieName: string, movieId?: string): Promise<PlaySource[]> {
    // 如果有movieId，直接获取播放链接
    if (movieId) {
      const url = `${API_CONFIG.YAOHU_BASE_URL}/yingshi?key=${API_CONFIG.YAOHU_API_KEY}&msg=${encodeURIComponent(movieName || '')}&id=${movieId}&n=1`
      console.log('获取播放源列表:', url)
      
      try {
        const response = await fetchWithTimeout(url, 15000)
        const text = await response.text()
        const json = JSON.parse(text)
        
        if (json.code === 200 && json.data?.episodes && Array.isArray(json.data.episodes)) {
          const sources: PlaySource[] = []
          
          // 线路1: 使用url字段
          const urlEpisodes = json.data.episodes.map((ep: any, idx: number) => ({
            id: String(idx + 1),
            name: ep.title || `第${idx + 1}集`,
            number: parseInt(ep.title?.match(/第(\d+)集/)?.[1] || '0') || idx + 1,
            url: ep.url || '',
            m3u8url: ep.m3u8url || ''
          }))
          
          if (urlEpisodes.length > 0 && urlEpisodes[0].url) {
            sources.push({
              id: '1',
              name: '线路1',
              url: urlEpisodes[0].url,
              quality: '720p',
              selected: true
            })
          }
          
          // 线路2: 使用m3u8url字段
          if (urlEpisodes.length > 0 && urlEpisodes[0].m3u8url) {
            sources.push({
              id: '2',
              name: '线路2',
              url: urlEpisodes[0].m3u8url,
              quality: '720p',
              selected: sources.length === 0
            })
          }
          
          return sources
        }
      } catch (e) {
        console.error('获取播放源列表失败:', e)
      }
    }
    
    // 返回空的播放源列表（需要先搜索）
    return []
  },

  // 模拟播放源
  getMockSources(): PlaySource[] {
    return [
      { id: '1', name: '线路1', url: '', quality: '720p' },
      { id: '2', name: '线路2', url: '', quality: '1080p' },
    ]
  },

  // Kuake马API搜索（用于首页分类数据）
  async kuakemaSearch(type: 'movie' | 'tv' | 'animation' | 'variety'): Promise<SearchResult> {
    try {
      const paths: Record<string, string> = {
        movie: '/movie',
        tv: '/tv',
        animation: '/dongman',
        variety: '/tv' // 综艺暂时使用电视剧接口
      }
      
      const path = paths[type] || '/movie'
      const baseUrls: string[] = (API_CONFIG as any).KUAKEMA_BASE_URLS?.length
        ? (API_CONFIG as any).KUAKEMA_BASE_URLS
        : [API_CONFIG.KUAKEMA_BASE_URL]

      let lastError: unknown = null

      for (const base of baseUrls) {
        const url = `${base}${path}`
        console.log('Kuake马搜索类型:', type, 'URL:', url)

        try {
          const response = await fetchWithTimeout(url, 10000)
          const json = await response.json()

          // 兼容不同返回结构：数组 / {data: []} / {list: []} / {result: []}
          const list =
            Array.isArray(json)
              ? json
              : Array.isArray((json as any)?.data)
                ? (json as any).data
                : Array.isArray((json as any)?.list)
                  ? (json as any).list
                  : Array.isArray((json as any)?.result)
                    ? (json as any).result
                    : []

          // 性能：首页分类只取前 N 条，避免一次解析 100 条导致卡顿
          const MAX_ITEMS = 24
          const limitedList = list.slice(0, MAX_ITEMS)

          if (limitedList.length === 0) {
            lastError = new Error('empty result')
            continue
          }

          const movies = limitedList.map((item: any) => ({
            id: String(item.id || Math.random()),
            title: item.title || item.name || '未知',
            poster_path:
              item.cover ||
              item.cover_pic ||
              item.coverPic ||
              item.coverUrl ||
              item.pic ||
              item.pic_url ||
              item.image ||
              item.image_url ||
              item.poster ||
              item.poster_url ||
              item.thumbnail ||
              item.thumbnail_url ||
              item.thumb ||
              item.thumb_url ||
              item.img ||
              item.img_url ||
              '',
            backdrop_path:
              item.cover ||
              item.cover_pic ||
              item.coverPic ||
              item.coverUrl ||
              item.pic ||
              item.pic_url ||
              item.image ||
              item.image_url ||
              item.poster ||
              item.poster_url ||
              item.thumbnail ||
              item.thumbnail_url ||
              item.thumb ||
              item.thumb_url ||
              item.img ||
              item.img_url ||
              '',
            overview: item.desc || item.description || '',
            vote_average: parseFloat(item.score) || 0,
            release_date: item.year || '',
            media_type: type === 'movie' ? 'movie' as const : 'tv' as const,
            genre_ids: [],
            area: item.area || '',
            type: item.type || '',
            class: '',
            update_time: item.update_time || '',
            remarks: item.remarks || ''
          }))

          console.log('Kuake马解析成功:', movies.length, '条')
          return { success: true, data: movies, error: '' }
        } catch (e) {
          lastError = e
          continue
        }
      }

      return { success: false, error: 'Kuake马分类接口请求失败' }
    } catch (error) {
      console.error('Kuake马搜索失败:', error)
      return { success: false, error: 'Kuake马分类接口请求失败' }
    }
  },

  // Kuake马API获取排行榜
  async kuakemaGetTopRated(type: 'movie' | 'tv' | 'animation'): Promise<SearchResult> {
    try {
      const paths: Record<string, string> = {
        movie: '/movie',
        tv: '/tv',
        animation: '/dongman'
      }
      
      const path = paths[type] || '/movie'
      const baseUrls: string[] = (API_CONFIG as any).KUAKEMA_BASE_URLS?.length
        ? (API_CONFIG as any).KUAKEMA_BASE_URLS
        : [API_CONFIG.KUAKEMA_BASE_URL]

      for (const base of baseUrls) {
        const url = `${base}${path}`
        console.log('Kuake马排行榜类型:', type, 'URL:', url)

        try {
          const response = await fetchWithTimeout(url, 10000)
          const json = await response.json()

          // 兼容不同返回结构：数组 / {data: []} / {list: []} / {result: []}
          const list =
            Array.isArray(json)
              ? json
              : Array.isArray((json as any)?.data)
                ? (json as any).data
                : Array.isArray((json as any)?.list)
                  ? (json as any).list
                  : Array.isArray((json as any)?.result)
                    ? (json as any).result
                    : []

          // 性能：榜单也只取前 N 条
          const MAX_ITEMS = 24
          const limitedList = list.slice(0, MAX_ITEMS)

          if (limitedList.length === 0) {
            continue
          }

          const movies = limitedList.map((item: any) => ({
            id: String(item.id || Math.random()),
            title: item.title || item.name || '未知',
            poster_path:
              item.cover ||
              item.cover_pic ||
              item.coverPic ||
              item.coverUrl ||
              item.pic ||
              item.pic_url ||
              item.image ||
              item.image_url ||
              item.poster ||
              item.poster_url ||
              item.thumbnail ||
              item.thumbnail_url ||
              item.thumb ||
              item.thumb_url ||
              item.img ||
              item.img_url ||
              '',
            backdrop_path:
              item.cover ||
              item.cover_pic ||
              item.coverPic ||
              item.coverUrl ||
              item.pic ||
              item.pic_url ||
              item.image ||
              item.image_url ||
              item.poster ||
              item.poster_url ||
              item.thumbnail ||
              item.thumbnail_url ||
              item.thumb ||
              item.thumb_url ||
              item.img ||
              item.img_url ||
              '',
            overview: item.desc || item.description || '',
            vote_average: parseFloat(item.score) || 0,
            release_date: item.year || '',
            media_type: type === 'movie' ? 'movie' as const : 'tv' as const,
            genre_ids: [],
            area: item.area || '',
            type: item.type || '',
            class: '',
            update_time: item.update_time || '',
            remarks: item.remarks || ''
          }))

          // 按评分排序
          const sortedMovies = movies.sort((a: any, b: any) => b.vote_average - a.vote_average)

          console.log('Kuake马排行榜解析成功:', sortedMovies.length, '条')
          return { success: true, data: sortedMovies, error: '' }
        } catch {
          continue
        }
      }

      return { success: false, error: 'Kuake马排行榜接口请求失败' }
    } catch (error) {
      console.error('Kuake马排行榜失败:', error)
      return { success: false, error: 'Kuake马排行榜接口请求失败' }
    }
  },

  // 妖狐API搜索备用方案
  async yaohuCategorySearchFallback(type: 'movie' | 'tv' | 'animation' | 'variety'): Promise<SearchResult> {
    try {
      const keywords: Record<string, string> = {
        movie: '电影',
        tv: '电视剧',
        animation: '动漫',
        variety: '综艺'
      }
      
      const keyword = keywords[type] || '电影'
      console.log('妖狐搜索类型:', type, '关键词:', keyword)
      
      const result = await this.yaohuSearch(keyword)
      
      if (result.success && result.data) {
        // 根据类型过滤结果
        let filteredData = result.data
        
        if (type === 'tv') {
          // 电视剧：包含内地剧/港剧等
          filteredData = result.data.filter((item: any) => 
            item.type?.includes('剧') || item.type?.includes('电视')
          )
        } else if (type === 'animation') {
          // 动漫
          filteredData = result.data.filter((item: any) => 
            item.type?.includes('动漫') || item.type?.includes('动画')
          )
        } else if (type === 'variety') {
          // 综艺
          filteredData = result.data.filter((item: any) => 
            item.type?.includes('综艺')
          )
        }
        
        // 如果过滤后没有数据，使用原始数据
        if (filteredData.length === 0) filteredData = result.data
        
        // 对数据进行映射，将 pic 字段映射到 poster_path 和 backdrop_path 字段
        const mappedData = filteredData.map((item: any) => ({
          id: String(item.id || Math.random()),
          title: item.title || item.name || '未知',
          poster_path: item.pic || '',
          backdrop_path: item.pic || '',
          overview: item.content || item.blurb || item.remarks || '',
          vote_average: parseFloat(item.score) || 0,
          release_date: item.year || '',
          media_type: (type === 'tv' || type === 'animation' || type === 'variety') ? 'tv' : 'movie',
          genre_ids: [],
          area: item.area || '',
          type: item.type || '',
          class: item.class || '',
          update_time: item.update_time || '',
          remarks: item.remarks || ''
        }))
        
        console.log('妖狐解析成功:', mappedData.length, '条')
        return { success: true, data: mappedData, error: '' }
      } else {
        return { success: false, error: result.error || '未找到相关影视' }
      }
    } catch (error) {
      console.error('妖狐搜索失败:', error)
      return { success: false, error: '网络错误' }
    }
  },

  // 妖狐API获取排行榜备用方案
  async yaohuGetTopRatedFallback(type: 'movie' | 'tv' | 'animation'): Promise<SearchResult> {
    try {
      // 由于妖狐API的热门关键词返回404，我们使用分类搜索的结果作为排行榜数据
      const result = await this.yaohuCategorySearchFallback(type)
      
      if (result.success && result.data) {
        // 按评分排序
        const sortedData = [...result.data].sort((a: any, b: any) => {
          const scoreA = parseFloat(a.score) || 0
          const scoreB = parseFloat(b.score) || 0
          return scoreB - scoreA
        })
        
        console.log('妖狐排行榜解析成功:', sortedData.length, '条')
        return { success: true, data: sortedData, error: '' }
      } else {
        return { success: false, error: result.error || '未找到相关影视' }
      }
    } catch (error) {
      console.error('妖狐排行榜失败:', error)
      return { success: false, error: '网络错误' }
    }
  }
}

export default parserService
