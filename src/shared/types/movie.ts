export interface Movie {
  id: string
  /** ID returned by the playback provider; distinct from the catalogue ID. */
  playId?: string
  title: string
  poster_path: string
  backdrop_path: string
  overview: string
  vote_average: number
  release_date: string
  media_type: 'movie' | 'tv'
  genre_ids: number[]
  // 妖狐API额外字段
  area?: string
  type?: string
  class?: string
  update_time?: string
  remarks?: string
  // WMDB API额外字段
  actor?: string
  director?: string
}

export interface TVShow extends Movie {
  media_type: 'tv'
  name: string
  first_air_date: string
}

export interface MovieDetail extends Movie {
  runtime: number
  genres: Genre[]
  production_countries: Country[]
}

export interface TVDetail extends TVShow {
  episode_run_time: number
  genres: Genre[]
  seasons: Season[]
}

export interface PlaySource {
  id: string
  name: string
  url: string
  quality: string
  selected?: boolean
}

export interface Episode {
  id: string
  name: string
  number: number
  still_path: string
  overview: string
  url?: string
  m3u8url?: string
}

export interface HistoryRecord {
  id: string
  movieId: string
  movie: Movie
  episode: number
  progress: number
  duration: number
  updatedAt: number
}

/** 播放队列中的单集项 */
export interface QueueItem {
  id: string
  movieId: string
  movie: Pick<Movie, 'id' | 'title' | 'poster_path'>
  episode: number
  episodeName: string
  sourceType: 'url' | 'm3u8url'
  quality: string
  url?: string
  m3u8url?: string
}

/** 用户保存的播单 */
export interface Playlist {
  id: string
  name: string
  items: QueueItem[]
  createdAt: number
  updatedAt: number
}

export interface Favorite extends Movie {
  addedAt: number
}

export interface Category {
  id: string
  name: string
  type: 'movie' | 'tv' | 'animation' | 'variety'
}

interface Genre {
  id: number
  name: string
}

interface Country {
  iso_3166_1: string
  name: string
}

interface Season {
  id: string
  name: string
  season_number: number
  episode_count: number
}
