export const MEDIA_TYPES = {
  MOVIE: 'movie',
  TV: 'tv',
  PERSON: 'person'
} as const

export const CATEGORIES = {
  MOVIE: 'movie',
  TV: 'tv',
  ANIMATION: 'animation'
} as const

export const PLAY_QUALITY = {
  SD: '360p',
  HD: '720p',
  FHD: '1080p',
  UHD: '4K'
} as const

export const PLAY_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

export const MAX_SEARCH_HISTORY = 10
export const MAX_HISTORY_RECORDS = 50
export const MAX_FAVORITES = 100
