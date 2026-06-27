import { useState, useEffect, useCallback } from 'react'
import { useMovieStore, useFavoriteStore, useHistoryStore } from '../../../shared/stores'
import { Movie, PlaySource, Episode } from '../../../shared/types/movie'
import { parserService } from '../../../shared/services/parser'

interface UseDetailResult {
  movie: Movie | null
  playSources: PlaySource[]
  selectedSource: string
  episodes: Episode[]
  selectedEpisode: number
  loading: boolean
  error: string | null
  isFavorite: boolean
  loadDetail: () => Promise<void>
  setSelectedSource: (id: string) => void
  setSelectedEpisode: (num: number) => void
  toggleFavorite: () => void
}

export function useDetail(movieId: string, initialMovie?: Movie): UseDetailResult {
  const [movie, setMovie] = useState<Movie | null>(initialMovie || null)
  const [playSources, setPlaySources] = useState<PlaySource[]>([])
  const [selectedSource, setSelectedSource] = useState('')
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { addFavorite, removeFavorite, isFavorite: checkFavorite } = useFavoriteStore()
  const { fetchPopularMovies, fetchPopularTVs } = useMovieStore()

  const isFavorite = movie ? checkFavorite(movie.id) : false

  const loadDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      let resolved: Movie | null = initialMovie || null

      if (!resolved) {
        await Promise.all([fetchPopularMovies(), fetchPopularTVs()])
        const store = useMovieStore.getState()
        const found =
          store.popularMovies.find((m) => m.id === movieId) ||
          store.popularTVs.find((m) => m.id === movieId)
        if (found) {
          resolved = found
          setMovie(found)
        }
      }

      const sources = await parserService.getPlaySources(resolved?.title || '')
      if (sources.length > 0) {
        setPlaySources(sources)
        setSelectedSource(sources[0].id)
      } else {
        const mockSources: PlaySource[] = [
          { id: '1', name: '线路1', url: 'https://example.com/video1.m3u8', quality: '720p' },
          { id: '2', name: '线路2', url: 'https://example.com/video2.m3u8', quality: '1080p' }
        ]
        setPlaySources(mockSources)
        setSelectedSource(mockSources[0].id)
      }

      if (resolved?.media_type === 'tv') {
        const mockEpisodes: Episode[] = Array.from({ length: 12 }, (_, i) => ({
          id: String(i + 1),
          name: `第${i + 1}集`,
          number: i + 1,
          still_path: '',
          overview: ''
        }))
        setEpisodes(mockEpisodes)
      }
    } catch (err) {
      setError('Failed to load details')
    } finally {
      setLoading(false)
    }
  }, [movieId, initialMovie, fetchPopularMovies, fetchPopularTVs])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const toggleFavorite = () => {
    if (!movie) return
    if (isFavorite) {
      removeFavorite(movie.id)
    } else {
      addFavorite(movie)
    }
  }

  return {
    movie,
    playSources,
    selectedSource,
    episodes,
    selectedEpisode,
    loading,
    error,
    isFavorite,
    loadDetail,
    setSelectedSource,
    setSelectedEpisode,
    toggleFavorite
  }
}
