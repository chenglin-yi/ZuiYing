export interface MovieListResponse {
  page: number
  results: any[]
  total_pages: number
  total_results: number
}

export interface MovieDetail {
  id: number
  title: string
  poster_path: string
  backdrop_path: string
  overview: string
  vote_average: number
  release_date: string
  runtime: number
  genres: { id: number; name: string }[]
  production_countries: { iso_3166_1: string; name: string }[]
}

export interface TVDetail {
  id: number
  name: string
  poster_path: string
  backdrop_path: string
  overview: string
  vote_average: number
  first_air_date: string
  episode_run_time: number[]
  genres: { id: number; name: string }[]
  seasons: { id: number; name: string; season_number: number; episode_count: number }[]
}

export interface SearchResponse {
  page: number
  results: any[]
  total_pages: number
  total_results: number
}

export interface Credits {
  id: number
  cast: { id: number; name: string; character: string; profile_path: string }[]
}
