import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, ScrollView, Platform } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { VideoRef } from 'react-native-video'
import { usePlayer } from '../hooks/usePlayer'
import { VideoPlayer, VideoControls, QualitySelector } from '../components'
import { Movie, Episode } from '../../../shared/types/movie'
import { colors, spacing } from '../../../shared/theme'
import { useHistoryStore } from '../../../shared/stores'
import { parserService } from '../../../shared/services/parser'
import { API_CONFIG } from '../../../config/api'
import { useOrientationChange } from '../../../shared/hooks'
import * as ScreenOrientation from 'expo-screen-orientation'

type RootStackParamList = {
  Main: undefined
  Detail: { movieId: string; movie?: Movie }
  Player: { movieId: string; movie?: Movie; episode?: number; url?: string }
}

interface PlayerScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Player'>
  route: RouteProp<RootStackParamList, 'Player'>
}

export function PlayerScreen({ navigation, route }: PlayerScreenProps) {
  const { movieId, movie, episode = 1, url } = route.params
  const [showControls, setShowControls] = useState(true)
  const [showQualitySelector, setShowQualitySelector] = useState(false)
  const [showEpisodeList, setShowEpisodeList] = useState(false)
  const [quality, setQuality] = useState('720p')
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const videoRef = useRef<VideoRef>(null)
  const resumeAppliedRef = useRef(false)
  const seekingRef = useRef(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [loadingEpisode, setLoadingEpisode] = useState(false)
  const isLandscape = useOrientationChange()
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [sourceType, setSourceType] = useState<'url' | 'm3u8url'>('url')

  const {
    playing,
    progress,
    duration,
    buffering,
    error,
    toggle,
    setProgress,
    setDuration,
    setBuffering
  } = usePlayer(url)

  const records = useHistoryStore((s) => s.records)
  const loadRecords = useHistoryStore((s) => s.loadRecords)
  const updateProgress = useHistoryStore((s) => s.updateProgress)

  useEffect(() => {
    loadRecords()
    
    // 组件卸载时恢复屏幕方向
    return () => {
      ScreenOrientation.unlockAsync()
    }
  }, [loadRecords])

  const loadEpisodes = useCallback(async () => {
    if (!movie) return
    
    try {
      const apiUrl = `${API_CONFIG.YAOHU_BASE_URL}/yingshi?key=${API_CONFIG.YAOHU_API_KEY}&msg=${encodeURIComponent(movie.title || '')}&id=${movieId}&n=1`
      console.log('获取剧集列表:', apiUrl)
      const response = await fetch(apiUrl)
      const text = await response.text()
      console.log('剧集列表返回:', text.substring(0, 500))
      const json = JSON.parse(text)
      
      if (json.code === 200 && json.data?.episodes && Array.isArray(json.data.episodes)) {
        const realEpisodes: Episode[] = json.data.episodes.map((ep: any, index: number) => {
          const epNum = parseInt(ep.title?.match(/第(\d+)集/)?.[1] || '0') || index + 1
          return {
            id: String(index + 1),
            name: ep.title || `第${epNum}集`,
            number: epNum,
            still_path: '',
            overview: '',
            url: ep.url || '',
            m3u8url: ep.m3u8url || ''
          }
        })
        console.log('解析到剧集数:', realEpisodes.length, '第一集url:', realEpisodes[0]?.url)
        setEpisodes(realEpisodes)
      } else {
        const mockEpisodes: Episode[] = Array.from({ length: 12 }, (_, i) => ({
          id: String(i + 1),
          name: `第${i + 1}集`,
          number: i + 1,
          still_path: '',
          overview: ''
        }))
        setEpisodes(mockEpisodes)
      }
    } catch (error) {
      console.error('获取剧集列表失败:', error)
      const mockEpisodes: Episode[] = Array.from({ length: 12 }, (_, i) => ({
        id: String(i + 1),
        name: `第${i + 1}集`,
        number: i + 1,
        still_path: '',
        overview: ''
      }))
      setEpisodes(mockEpisodes)
    }
  }, [movie, movieId])

  useEffect(() => {
    if (movie) {
      loadEpisodes()
    }
  }, [movie, loadEpisodes])

  const resumeAt = useMemo(() => {
    const r = records.find((rec) => rec.movieId === movieId && rec.episode === episode)
    if (!r || r.duration <= 0 || r.progress <= 0) return 0
    if (r.progress >= r.duration - 1) return 0
    return r.progress
  }, [records, movieId, episode])

  useEffect(() => {
    resumeAppliedRef.current = false
    setPlayerReady(false)
  }, [url, movieId, episode])

  useEffect(() => {
    if (!playerReady || resumeAt <= 0 || resumeAppliedRef.current) return
    videoRef.current?.seek(resumeAt)
    setProgress(resumeAt)
    resumeAppliedRef.current = true
  }, [playerReady, resumeAt, setProgress])

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout
    if (showControls && playing) {
      hideTimeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout)
    }
  }, [showControls, playing])

  const handlePlayPause = () => {
    toggle()
    setShowControls(true)
  }

  const handleSeek = useCallback(
    (time: number) => {
      seekingRef.current = true
      videoRef.current?.seek(time)
      setProgress(time)
      setTimeout(() => {
        seekingRef.current = false
      }, 500)
    },
    [setProgress]
  )

  const handleQualityChange = async (newQuality: string) => {
    setQuality(newQuality)
    
    // 重新获取播放链接
    if (movie) {
      setLoadingEpisode(true)
      try {
        const playInfo = await parserService.getPlayUrlById(movieId, episode, movie.title, newQuality)
        if (playInfo.url) {
          navigation.replace('Player', {
            movieId: movie.id,
            movie: movie,
            episode: episode,
            url: playInfo.url
          })
        } else {
          Alert.alert('切换失败', '无法获取该清晰度的播放链接')
        }
      } catch (error) {
        console.error('获取播放链接失败:', error)
        Alert.alert('切换失败', '获取播放链接时出错')
      } finally {
        setLoadingEpisode(false)
      }
    }
  }

  const handleEpisodeSelect = async (episodeNumber: number) => {
    if (!movie) return
    
    setShowEpisodeList(false)
    
    const currentEpisode = episodes.find(ep => ep.number === episodeNumber)
    if (currentEpisode?.url) {
      navigation.replace('Player', {
        movieId: movie.id,
        movie: movie,
        episode: episodeNumber,
        url: currentEpisode.url
      })
      return
    }
    
    setLoadingEpisode(true)
    
    try {
      const playInfo = await parserService.getPlayUrlById(movieId, episodeNumber, movie.title)
      if (playInfo.url) {
        navigation.replace('Player', {
          movieId: movie.id,
          movie: movie,
          episode: episodeNumber,
          url: playInfo.url
        })
      } else {
        Alert.alert('播放失败', '无法获取该集的播放链接')
      }
    } catch (error) {
      console.error('获取播放链接失败:', error)
      Alert.alert('播放失败', '获取播放链接时出错')
    } finally {
      setLoadingEpisode(false)
    }
  }

  const handleLoad = useCallback(
    (data: { duration: number }) => {
      if (data.duration > 0) {
        setDuration(data.duration)
      }
      setPlayerReady(true)
    },
    [setDuration]
  )

  const handleProgress = useCallback(
    (data: { currentTime: number; seekableDuration: number }) => {
      if (seekingRef.current) return
      setProgress(data.currentTime)
      const total = data.seekableDuration > 0 ? data.seekableDuration : duration
      if (total > 0) {
        setDuration((prev) => (prev > 0 ? prev : total))
      }
      if (data.seekableDuration > 0) {
        updateProgress(movieId, episode, data.currentTime, data.seekableDuration)
      }
    },
    [setProgress, setDuration, duration, updateProgress, movieId, episode]
  )

  const handleBuffer = useCallback(
    (data: { isBuffering?: boolean }) => {
      setBuffering(Boolean(data.isBuffering))
    },
    [setBuffering]
  )

  const handleError = (err: any) => {
    console.error('Player error:', err)
    Alert.alert('播放失败', '请尝试切换播放源', [
      { text: '确定', onPress: () => navigation.goBack() }
    ])
  }

  const handleBack = () => {
    navigation.goBack()
  }

  const handleVolumeChange = (volume: number) => {
    videoRef.current?.setVolume(volume)
  }

  const handleQualityPress = () => {
    setShowQualitySelector(true)
  }

  const handleFullScreen = async () => {
    if (isLandscape) {
      // 横屏时，退出全屏
      setIsFullScreen(false)
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    } else {
      // 竖屏时，进入全屏
      setIsFullScreen(true)
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    }
  }

  const handleSourceTypeChange = () => {
    const newSourceType = sourceType === 'url' ? 'm3u8url' : 'url'
    setSourceType(newSourceType)
    
    const currentEpisode = episodes.find(ep => ep.number === episode)
    if (currentEpisode) {
      const newUrl = newSourceType === 'url' ? currentEpisode.url : currentEpisode.m3u8url
      if (newUrl) {
        navigation.replace('Player', {
          movieId: movieId,
          movie: movie,
          episode: episode,
          url: newUrl
        })
      } else {
        Alert.alert('切换失败', `当前集数没有${newSourceType}源`)
      }
    }
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>播放出错</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryText}>返回</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isFullScreenMode = isLandscape || isFullScreen

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View
        style={[
          styles.playerContainer,
          isFullScreenMode ? styles.playerContainerFull : styles.playerContainerPortrait
        ]}
      >
        <VideoPlayer
          source={url || ''}
          paused={!playing}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onError={handleError}
          videoRef={videoRef}
        />

        <VideoControls
          currentTime={progress}
          duration={duration}
          playing={playing}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onFullScreen={handleFullScreen}
          isFullScreen={isFullScreen}
          onSourceTypeChange={episodes.length > 0 ? handleSourceTypeChange : undefined}
          sourceType={sourceType}
          onBack={handleBack}
          title={movie?.title}
          episode={episode}
          showControls={showControls}
          onToggleControls={() => setShowControls(!showControls)}
          onVolumeChange={handleVolumeChange}
          onQualityPress={handleQualityPress}
          quality={quality}
        />

        {(buffering || loadingEpisode) && (
          <View style={styles.buffering}>
            <Text style={styles.bufferingText}>{loadingEpisode ? '切换清晰度中...' : '加载中...'}</Text>
          </View>
        )}
        
        {buffering && (
          <View style={styles.networkIndicator}>
            <Text style={styles.networkText}>📶 网络加载中</Text>
          </View>
        )}
      </View>

      {/* 竖屏时显示下方内容 */}
      {!isFullScreenMode && (
        <View style={styles.portraitContent}>
          {movie && (
            <ScrollView style={styles.infoScroll}>
              <View style={styles.infoSection}>
                <Text style={styles.portraitTitle}>{movie.title}</Text>
                {episode > 1 && <Text style={styles.portraitEpisode}>第{episode}集</Text>}
                {movie.overview && (
                  <Text style={styles.portraitOverview} numberOfLines={3}>
                    {movie.overview}
                  </Text>
                )}
              </View>
            </ScrollView>
          )}
          
          {episodes.length > 0 && (
            <View style={styles.portraitEpisodes}>
              <Text style={styles.portraitSectionTitle}>选集</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.episodeScroll}>
                {episodes.slice(0, 20).map((ep) => (
                  <TouchableOpacity
                    key={ep.id}
                    style={[
                      styles.episodeChip,
                      ep.number === episode && styles.episodeChipActive
                    ]}
                    onPress={() => handleEpisodeSelect(ep.number)}
                  >
                    <Text style={[
                      styles.episodeChipText,
                      ep.number === episode && styles.episodeChipTextActive
                    ]}>
                      {ep.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {episodes.length > 20 && (
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={() => setShowEpisodeList(true)}
                >
                  <Text style={styles.moreButtonText}>查看全部{episodes.length}集</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      <QualitySelector
        visible={showQualitySelector}
        currentQuality={quality}
        onSelect={handleQualityChange}
        onClose={() => setShowQualitySelector(false)}
      />

      {showEpisodeList && (
        <View style={styles.episodeListContainer}>
          <View style={styles.episodeListHeader}>
            <Text style={styles.episodeListTitle}>选择集数</Text>
            <TouchableOpacity onPress={() => setShowEpisodeList(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.episodeList}>
            {episodes.map((ep) => (
              <TouchableOpacity
                key={ep.id}
                style={[
                  styles.episodeItem,
                  ep.number === episode && styles.episodeItemActive
                ]}
                onPress={() => handleEpisodeSelect(ep.number)}
              >
                <Text
                  style={[
                    styles.episodeItemText,
                    ep.number === episode && styles.episodeItemTextActive
                  ]}
                >
                  {ep.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  playerContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#000000'
  },
  playerContainerPortrait: {
    position: 'relative',
    height: 250,
    width: '100%'
  },
  playerContainerFull: {
    position: 'relative',
    flex: 1,
    width: '100%',
    height: '100%'
  },
  buffering: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -10 }],
    justifyContent: 'center',
    alignItems: 'center'
  },
  bufferingText: {
    fontSize: 16,
    color: '#FFFFFF'
  },
  networkIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  networkText: {
    fontSize: 12,
    color: '#FFFFFF'
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8
  },
  retryText: {
    fontSize: 16,
    color: '#FFFFFF'
  },
  portraitContent: {
    flex: 1,
    backgroundColor: colors.background
  },
  infoScroll: {
    maxHeight: 200
  },
  infoSection: {
    padding: spacing.md
  },
  portraitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary
  },
  portraitEpisode: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  portraitOverview: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20
  },
  portraitEpisodes: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  portraitSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm
  },
  episodeScroll: {
    paddingHorizontal: spacing.md
  },
  episodeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginRight: spacing.sm
  },
  episodeChipActive: {
    backgroundColor: colors.primary
  },
  episodeChipText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  episodeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  moreButton: {
    padding: spacing.md,
    alignItems: 'center'
  },
  moreButtonText: {
    fontSize: 14,
    color: colors.primary
  },
  episodeListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: spacing.md
  },
  episodeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  episodeListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  closeText: {
    fontSize: 20,
    color: '#FFFFFF'
  },
  episodeList: {
    maxHeight: 300
  },
  episodeItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  episodeItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  episodeItemText: {
    fontSize: 14,
    color: '#FFFFFF'
  },
  episodeItemTextActive: {
    color: colors.primary,
    fontWeight: '600'
  }
})
