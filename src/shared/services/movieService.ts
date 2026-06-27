import { Movie } from '../types/movie'
import { parserService } from './parser'

export const movieService = {
  // 根据类型获取热门数据
  async getPopularByType(type: 'movie' | 'tv' | 'variety' | 'animation'): Promise<Movie[]> {
    // 根据type字段过滤
    const typeFilters: Record<string, string[]> = {
      movie: ['电影', '2024电影', '热门电影'],
      tv: ['电视剧', '国产剧', '热播剧'],
      variety: ['综艺', '综艺节目', '真人秀'],
      animation: ['动漫', '动画', '国漫']
    }
    
    const searchKeywords = typeFilters[type] || typeFilters.movie
    
    for (const keyword of searchKeywords) {
      try {
        const result = await parserService.yaohuSearch(keyword)
        console.log(`搜索${keyword}:`, result.success ? `成功-${result.data?.length}条` : '失败')
        
        if (result.success && result.data && result.data.length > 0) {
          // 根据type过滤结果
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
          
          if (filteredData.length === 0) filteredData = result.data.slice(0, 12)
          
          return filteredData.map((item: any) => ({
            id: String(item.id || Math.random()),
            title: item.title || item.name || '未知',
            poster_path: item.pic || '',
            backdrop_path: item.pic || '',
            overview: item.content || item.blurb || item.remarks || '',
            vote_average: parseFloat(item.score) || 0,
            release_date: item.year || '',
            media_type: (type === 'variety' || type === 'animation') ? 'tv' : type,
            genre_ids: [],
            area: item.area || '',
            type: item.type || '',
            class: item.class || '',
            update_time: item.update_time || '',
            remarks: item.remarks || ''
          }))
        }
      } catch (error) {
        console.error(`获取${keyword}失败:`, error)
      }
    }
    
    return this.getDefaultMovies(type)
  },

  // 分类检索
  async getMoviesByCategory(category: string, page: number = 1, limit: number = 20): Promise<Movie[]> {
    try {
      // 使用Kuake马API进行分类检索
      let result
      switch (category) {
        case 'movie':
          result = await parserService.kuakemaSearch('movie')
          break
        case 'tv':
          result = await parserService.kuakemaSearch('tv')
          break
        case 'animation':
          result = await parserService.kuakemaSearch('animation')
          break
        case 'variety':
          result = await parserService.kuakemaSearch('variety')
          break
        default:
          result = await parserService.kuakemaSearch('movie')
      }
      
      if (result.success && result.data) {
        return result.data.map((item: any) => ({
          id: String(item.id || Math.random()),
          title: item.title || item.name || '未知',
          poster_path: item.poster_path || item.pic || '',
          backdrop_path: item.backdrop_path || item.pic || '',
          overview: item.overview || item.content || item.blurb || item.remarks || '',
          vote_average: item.vote_average || parseFloat(item.score) || 0,
          release_date: item.release_date || item.year || '',
          media_type: item.media_type || 'movie',
          genre_ids: item.genre_ids || [],
          area: item.area || '',
          type: item.type || '',
          class: item.class || '',
          update_time: item.update_time || '',
          remarks: item.remarks || ''
        }))
      }
    } catch (error) {
      console.error(`分类检索失败:`, error)
    }
    return []
  },

  // 获取排行榜数据
  async getTopRated(category: 'movie' | 'tv' | 'animation'): Promise<Movie[]> {
    try {
      const result = await parserService.kuakemaGetTopRated(category)
      
      if (result.success && result.data) {
        return result.data.map((item: any) => ({
          id: String(item.id || Math.random()),
          title: item.title || item.name || '未知',
          poster_path: item.poster_path || item.pic || '',
          backdrop_path: item.backdrop_path || item.pic || '',
          overview: item.overview || item.content || item.blurb || item.remarks || '',
          vote_average: item.vote_average || parseFloat(item.score) || 0,
          release_date: item.release_date || item.year || '',
          media_type: item.media_type || 'movie',
          genre_ids: item.genre_ids || [],
          area: item.area || '',
          type: item.type || '',
          class: item.class || '',
          update_time: item.update_time || '',
          remarks: item.remarks || ''
        }))
      }
    } catch (error) {
      console.error(`获取排行榜失败:`, error)
    }
    return []
  },

  async getPopularMovies(page: number = 1): Promise<Movie[]> {
    return this.getPopularByType('movie')
  },

  async getPopularTVs(page: number = 1): Promise<Movie[]> {
    return this.getPopularByType('tv')
  },

  async getPopularVariety(page: number = 1): Promise<Movie[]> {
    return this.getPopularByType('variety')
  },

  async getPopularAnimation(page: number = 1): Promise<Movie[]> {
    return this.getPopularByType('animation')
  },

  async searchMovies(query: string): Promise<Movie[]> {
    try {
      const result = await parserService.yaohuSearch(query)
      console.log('搜索结果:', result.success ? `成功-${result.data?.length}条` : '失败')
      if (result.success && result.data && result.data.length > 0) {
        return result.data.map((item: any) => ({
          id: String(item.id || Math.random()),
          title: item.title || item.name || '未知',
          poster_path: item.pic || '',
          backdrop_path: item.pic || '',
          overview: item.content || item.blurb || item.remarks || '',
          vote_average: parseFloat(item.score) || 0,
          release_date: item.year || '',
          media_type: 'movie' as const,
          genre_ids: [],
          area: item.area || '',
          type: item.type || '',
          class: item.class || '',
          update_time: item.update_time || '',
          remarks: item.remarks || ''
        }))
      }
    } catch (error) {
      console.error('搜索失败:', error)
    }
    return []
  },

  getDefaultMovies(mediaType: 'movie' | 'tv' | 'variety' | 'animation'): Movie[] {
    const defaults: Record<string, Movie[]> = {
      movie: [
        { id: '1', title: '流浪地球', poster_path: 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2549880883.jpg', backdrop_path: '', overview: '太阳即将毁灭...', vote_average: 8.5, release_date: '2023', media_type: 'movie', genre_ids: [878], area: '中国大陆' },
      ],
      tv: [
        { id: '1', title: '狂飙', poster_path: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2885220156.jpg', backdrop_path: '', overview: '京海市扫黑...', vote_average: 8.5, release_date: '2023', media_type: 'tv', genre_ids: [18], area: '中国大陆' },
      ],
      variety: [
        { id: '1', title: '奔跑吧', poster_path: 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2553996371.jpg', backdrop_path: '', overview: '综艺真人秀', vote_average: 7.5, release_date: '2023', media_type: 'tv', genre_ids: [] },
      ],
      animation: [
        { id: '1', title: '斗破苍穹', poster_path: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2520099949.jpg', backdrop_path: '', overview: '玄幻动漫', vote_average: 7.5, release_date: '2023', media_type: 'tv', genre_ids: [] },
      ]
    }
    return defaults[mediaType] || defaults.movie
  }
}

export default movieService
