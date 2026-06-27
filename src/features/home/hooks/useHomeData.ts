import { useMovieStore } from '../../../shared/stores'

export function useHomeData() {
  const {
    popularMovies,
    popularTVs,
    varietyShows,
    animationShows,
    categories,
    currentCategory,
    loading,
    error,
    loadHome,
    setCategory
  } = useMovieStore()

  const movies =
    currentCategory === 'movie'
      ? popularMovies
      : currentCategory === 'tv'
        ? popularTVs
        : currentCategory === 'variety'
          ? varietyShows
          : animationShows

  return {
    movies,
    categories,
    currentCategory,
    loading,
    error,
    loadHome,
    setCategory
  }
}
