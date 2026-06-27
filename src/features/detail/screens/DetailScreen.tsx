import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMovieStore, useFavoriteStore, useHistoryStore } from '../../../shared/stores'
import { Movie, PlaySource, Episode } from '../../../shared/types/movie'
import { MovieHeader, PlaySourceList, EpisodeList } from '../components'
import { Loading, Error } from '../../../shared/components'
import { colors, spacing } from '../../../shared/theme'
import { parserService } from '../../../shared/services/parser'
import { API_CONFIG } from '../../../config/api'
import { useAdaptiveValue, useResponsivePadding } from '../../../shared/utils/responsive'

type RootStackParamList = {
  Main: undefined
  Detail: { movieId: string; movie?: Movie }
  Player: { movieId: string; movie?: Movie; episode?: number; url?: string }
}

interface DetailScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Detail'>
  route: RouteProp<RootStackParamList, 'Detail'>
}

export function DetailScreen({ navigation, route }: DetailScreenProps) {
  const { movieId, movie: initialMovie } = route.params
  const [movie, setMovie] = useState<Movie | null>(initialMovie || null)
  const [playSources, setPlaySources] = useState<PlaySource[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overviewExpanded, setOverviewExpanded] = useState(false)
  const [movieIntro, setMovieIntro] = useState('')

  const insets = useSafeAreaInsets()
  const backTop = useAdaptiveValue(50, insets.top + 16)
  const { horizontalPadding } = useResponsivePadding()

  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore()
  const { addRecord } = useHistoryStore()
  const { fetchPopularMovies, fetchPopularTVs } = useMovieStore()

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

      // 使用movie ID获取播放源
      const movieIdNum = resolved?.id || ''
      
      // 获取详情数据（包含intro和episodes）
      const detailUrl = `${API_CONFIG.YAOHU_BASE_URL}/yingshi?key=${API_CONFIG.YAOHU_API_KEY}&msg=${encodeURIComponent(resolved?.title || '')}&id=${movieIdNum}&n=1`
      console.log('获取详情:', detailUrl)
      
      try {
        const response = await fetch(detailUrl)
        const text = await response.text()
        const json = JSON.parse(text)
        
        if (json.code === 200 && json.data) {
          // 设置简介
          if (json.data.intro || json.data.blurb) {
            setMovieIntro(json.data.intro || json.data.blurb || '')
          }
          
          // 设置剧集列表
          if (json.data.episodes && Array.isArray(json.data.episodes)) {
            const realEpisodes: Episode[] = json.data.episodes.map((ep: any, idx: number) => ({
              id: String(idx + 1),
              name: ep.title || `第${idx + 1}集`,
              number: parseInt(ep.title?.match(/第(\d+)集/)?.[1] || '0') || idx + 1,
              still_path: '',
              overview: '',
              url: ep.url || '',
              m3u8url: ep.m3u8url || ''
            }))
            setEpisodes(realEpisodes)
          }
        }
      } catch (e) {
        console.error('获取详情失败:', e)
      }

      // 获取播放源列表
      const sources = await parserService.getPlaySources(resolved?.title || '', movieIdNum)
      if (sources.length > 0) {
        setPlaySources(sources)
        setSelectedSource(sources[0].id)
      } else {
        setPlaySources([{ id: '1', name: '点击获取播放链接', url: '', quality: '720p', selected: true }])
        setSelectedSource('1')
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

  const handleFavorite = () => {
    if (!movie) return
    if (isFavorite(movie.id)) {
      removeFavorite(movie.id)
      Alert.alert('已取消收藏')
    } else {
      addFavorite(movie)
      Alert.alert('收藏成功')
    }
  }

  const handlePlay = async () => {
    if (!movie) return
    
    const source = playSources.find(s => s.id === selectedSource)
    if (!source) {
      Alert.alert('请选择播放源')
      return
    }

    // 优先使用当前选中的剧集的url
    let playUrl = ''
    const currentEpisode = episodes.find(ep => ep.number === selectedEpisode)
    if (currentEpisode?.url) {
      playUrl = currentEpisode.url
    } else if (source.url) {
      playUrl = source.url
    } else {
      // 如果没有播放链接，需要获取
      Alert.alert('正在获取播放链接...')
      const movieIdNum = movie.id
      const playInfo = await parserService.getPlayUrlById(movieIdNum, selectedEpisode, movie.title)
      playUrl = playInfo.url
      
      if (!playUrl) {
        Alert.alert('获取播放链接失败，请重试')
        return
      }
    }

    addRecord(movie, selectedEpisode)
    
    navigation.navigate('Player', {
      movieId: movie.id,
      movie: movie,
      episode: selectedEpisode,
      url: playUrl
    })
  }

  const handleSourceSelect = (source: PlaySource) => {
    setSelectedSource(source.id)
  }

  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode.number)
  }

  const handleBack = () => {
    navigation.goBack()
  }

  if (loading) {
    return <Loading />
  }

  if (error || !movie) {
    return <Error message={error || 'Movie not found'} onRetry={loadDetail} />
  }

  const favorite = isFavorite(movie.id)

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity style={[styles.backButton, { top: backTop, left: horizontalPadding }]} onPress={handleBack}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>

        <MovieHeader movie={movie} />

        <View style={[styles.actions, { paddingHorizontal: horizontalPadding }]}>
          <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
            <Text style={styles.actionText}>{favorite ? '❤️ 已收藏' : '🤍 收藏'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePlay}
          >
            <Text style={[styles.actionText, styles.playText]}>▶️ 播放</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
          <Text style={styles.sectionTitle}>简介</Text>
          <TouchableOpacity onPress={() => setOverviewExpanded(!overviewExpanded)}>
            <Text 
              style={styles.overview} 
              numberOfLines={overviewExpanded ? undefined : 3}
            >
              {movieIntro || movie.overview || '暂无简介'}
            </Text>
          </TouchableOpacity>
        </View>

        {playSources.length > 0 && (
          <PlaySourceList
            sources={playSources}
            selectedSource={selectedSource}
            onSourceSelect={handleSourceSelect}
          />
        )}

        {episodes.length > 0 && (
          <EpisodeList
            episodes={episodes}
            selectedEpisode={selectedEpisode}
            onEpisodeSelect={handleEpisodeSelect}
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollView: {
    flex: 1
  },
  backButton: {
    position: 'absolute',
    zIndex: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  backText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    marginTop: 70,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  playText: {
    color: '#FFFFFF',
  },
  section: {
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  overview: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
})
