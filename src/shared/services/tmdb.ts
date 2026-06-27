import apiClient, { TMDB_API_KEY } from './apiClient'
import { Movie, MovieDetail, TVDetail } from '../types/movie'

const getConfig = () => ({
  api_key: TMDB_API_KEY,
  language: 'zh-CN'
})

export const tmdbService = {
  async getPopularMovies(page: number = 1) {
    return apiClient.get('/movie/popular', {
      params: { ...getConfig(), page }
    })
  },

  async getPopularTVs(page: number = 1) {
    return apiClient.get('/tv/popular', {
      params: { ...getConfig(), page }
    })
  },

  async getTrendingMovies(page: number = 1) {
    return apiClient.get('/trending/movie/week', {
      params: { ...getConfig(), page }
    })
  },

  async getTrendingTVs(page: number = 1) {
    return apiClient.get('/trending/tv/week', {
      params: { ...getConfig(), page }
    })
  },

  async searchMulti(query: string, page: number = 1) {
    return apiClient.get('/search/multi', {
      params: { ...getConfig(), query, page }
    })
  },

  async getMovieDetail(id: string) {
    return apiClient.get(`/movie/${id}`, {
      params: getConfig()
    })
  },

  async getTVDetail(id: string) {
    return apiClient.get(`/tv/${id}`, {
      params: getConfig()
    })
  },

  async getMovieCredits(id: string) {
    return apiClient.get(`/movie/${id}/credits`, {
      params: getConfig()
    })
  },

  async getTVCredits(id: string) {
    return apiClient.get(`/tv/${id}/credits`, {
      params: getConfig()
    })
  },

  async getMovieGenres() {
    return apiClient.get('/genre/movie/list', {
      params: getConfig()
    })
  },

  async getTVGenres() {
    return apiClient.get('/genre/tv/list', {
      params: getConfig()
    })
  },

  async discoverMovies(genreId?: number, page: number = 1) {
    return apiClient.get('/discover/movie', {
      params: { ...getConfig(), with_genres: genreId, page }
    })
  },

  async discoverTVs(genreId?: number, page: number = 1) {
    return apiClient.get('/discover/tv', {
      params: { ...getConfig(), with_genres: genreId, page }
    })
  }
}

export default tmdbService
