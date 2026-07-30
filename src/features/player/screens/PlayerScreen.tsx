import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { VideoRef } from 'react-native-video'
import * as ScreenOrientation from 'expo-screen-orientation'
import { usePlayer } from '../hooks/usePlayer'
import {
  VideoPlayer,
  VideoControls,
  QualitySelector,
  CountdownOverlay,
  PlaybackSpeedSelector,
  QueueManagerModal,
  PlaybackSettings,
} from '../components'
import { Movie, Episode, QueueItem } from '../../../shared/types/movie'
import { colors, spacing } from '../../../shared/theme'
import { useHistoryStore, usePlaylistStore, useSettingsStore } from '../../../shared/stores'
import { parserService } from '../../../shared/services/parser'
import { API_CONFIG } from '../../../config/api'
import { useOrientationChange } from '../../../shared/hooks/useOrientationChange'

type RootStackParamList = {
  Main: undefined
  Detail: { movieId: string; movie?: Movie }
  Player: { movieId: string; movie?: Movie; episode?: number; url?: string; episodes?: Episode[] }
}

interface PlayerScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Player'>
  route: RouteProp<RootStackParamList, 'Player'>
}

export function PlayerScreen({ navigation, route }: PlayerScreenProps) {
  const { movieId, movie, episode = 1, url, episodes: initialEpisodes } = route.params
  const [showControls, setShowControls] = useState(true)
  const [showQualitySelector, setShowQualitySelector] = useState(false)
  const [showEpisodeList, setShowEpisodeList] = useState(false)
  const [showSpeedSelector, setShowSpeedSelector] = useState(false)
  const [showQueueModal, setShowQueueModal] = useState(false)
  const [showPlaybackSettings, setShowPlaybackSettings] = useState(false)
  const [quality, setQuality] = useState('720p')
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes || [])
  const [countdownVisible, setCountdownVisible] = useState(false)
  const [nextEpisodeTitle, setNextEpisodeTitle] = useState('')
  const [episodesError, setEpisodesError] = useState<string | null>(null)

  const videoRef = useRef<VideoRef>(null)
  const orientationChangingRef = useRef(false)
  const resumeAppliedRef = useRef(false)
  const seekingRef = useRef(false)
  const introSkippedRef = useRef(false)
  const outroSkippedRef = useRef(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [loadingEpisode, setLoadingEpisode] = useState(false)
  const [sourceType, setSourceType] = useState<'url' | 'm3u8url'>('url')

  const isLandscape = useOrientationChange()
  const [isFullScreen, setIsFullScreen] = useState(false)

  const [currentEpisode, setCurrentEpisode] = useState(episode)
  const {
    settings,
    updateSettings,
    loadSettings,
  } = useSettingsStore()

  const {
    url: playerUrl,
    playing,
    progress,
    duration,
    buffering,
    error,
    rate,
    play,
    pause,
    toggle,
    setProgress,
    setDuration,
    setBuffering,
    setRate,
    changeUrl,
  } = usePlayer(url, settings.playSpeed)

  const records = useHistoryStore((s) => s.records)
  const loadRecords = useHistoryStore((s) => s.loadRecords)
  const updateProgress = useHistoryStore((s) => s.updateProgress)

  const {
    currentQueue,
    currentIndex,
    setQueue,
    moveToNext,
    moveToIndex,
    removeFromQueue,
    clearQueue,
    hasNext: hasNextInQueue,
  } = usePlaylistStore()

  useEffect(() => {
    loadSettings()
    loadRecords()
  }, [loadSettings, loadRecords])

  // 当设置加载完成（首次可能为默认值）后，同步 rate
  useEffect(() => {
    if (settings.playSpeed > 0) {
      setRate(settings.playSpeed)
    }
  }, [settings.playSpeed, setRate])

  // 如果进入播放页时没有 url，但队列有数据，则自动播放队列当前项
  useEffect(() => {
    if (!url && currentQueue.length > 0 && currentIndex >= 0) {
      const item = currentQueue[currentIndex]
      if (item) {
        switchToQueueItem(item)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const unlock = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
      } catch (e) {
        console.warn('解锁方向失败:', e)
      }
    }
    unlock()

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch((e) => {
        console.warn('恢复竖屏方向失败:', e)
      })
    }
  }, [])

  const loadEpisodes = useCallback(async () => {
    if (!movie) return

    // 验证 movieId 有效性
    if (!movieId || movieId === 'undefined' || movieId === 'null') {
      console.warn('无效的 movieId，跳过剧集列表加载:', movieId)
      return
    }

    try {
      setEpisodesError(null)
      const apiUrl = `${API_CONFIG.YAOHU_BASE_URL}/yingshi?key=${API_CONFIG.YAOHU_API_KEY}&msg=${encodeURIComponent(movie.title || '')}&n=1`
      console.log('获取剧集列表:', apiUrl)
      const response = await fetch(apiUrl)
      const text = await response.text()
      console.log('剧集列表返回:', text.substring(0, 500))
      const json = JSON.parse(text)

      if (json.code === 200 && json.data?.episodes && Array.isArray(json.data.episodes) && json.data.episodes.length > 0) {
        const realEpisodes: Episode[] = json.data.episodes.map((ep: any, index: number) => {
          const epNum = parseInt(ep.title?.match(/第(\d+)集/)?.[1] || '0') || index + 1
          return {
            id: String(index + 1),
            name: ep.title || `第${epNum}集`,
            number: epNum,
            still_path: '',
            overview: '',
            url: ep.url || '',
            m3u8url: ep.m3u8url || '',
          }
        })
        setEpisodes(realEpisodes)
      } else if (json.code === 200 && json.data?.list && Array.isArray(json.data.list) && json.data.list.length > 0) {
        // 兼容旧格式：部分接口直接返回 list
        const realEpisodes: Episode[] = json.data.list.map((ep: any, index: number) => {
          const epNum = parseInt(ep.title?.match(/第(\d+)集/)?.[1] || '0') || parseInt(ep.n) || index + 1
          return {
            id: String(index + 1),
            name: ep.title || ep.name || `第${epNum}集`,
            number: epNum,
            still_path: '',
            overview: '',
            url: ep.url || '',
            m3u8url: ep.m3u8url || '',
          }
        })
        setEpisodes(realEpisodes)
      } else {
        const msg = json.msg || '未获取到剧集数据'
        console.warn('获取剧集列表异常:', msg, json)
        setEpisodesError(msg)
      }
    } catch (error) {
      console.error('获取剧集列表失败:', error)
      setEpisodesError('网络异常，无法加载剧集列表')
    }
  }, [movie, movieId])

  useEffect(() => {
    if (!movie) return
    // 如果已经从详情页带入剧集数据，则不再重复请求，避免接口异常时回退到空数据
    if (initialEpisodes && initialEpisodes.length > 0) {
      console.log('使用详情页传入的剧集数据:', initialEpisodes.length, '集')
      return
    }
    loadEpisodes()
  }, [movie, loadEpisodes, initialEpisodes])

  const resumeAt = useMemo(() => {
    const r = records.find((rec) => rec.movieId === movieId && rec.episode === currentEpisode)
    if (!r || r.duration <= 0 || r.progress <= 0) return 0
    if (r.progress >= r.duration - 1) return 0
    return r.progress
  }, [records, movieId, currentEpisode])

  // 播放链接变化时重置播放器就绪与跳过状态
  useEffect(() => {
    resumeAppliedRef.current = false
    introSkippedRef.current = false
    outroSkippedRef.current = false
    setPlayerReady(false)
  }, [playerUrl])

  useEffect(() => {
    if (!playerReady || resumeAt <= 0 || resumeAppliedRef.current) return
    videoRef.current?.seek(resumeAt)
    setProgress(resumeAt)
    resumeAppliedRef.current = true
  }, [playerReady, resumeAt, setProgress])

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout
    if (showControls && playing && !countdownVisible) {
      hideTimeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout)
    }
  }, [showControls, playing, countdownVisible])

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

  const resolveEpisodeUrl = useCallback(
    async (episodeNumber: number, preferUrl?: string) => {
      if (preferUrl) return preferUrl

      const episodeData = episodes.find((ep) => ep.number === episodeNumber)
      const cachedUrl = sourceType === 'url' ? episodeData?.url : episodeData?.m3u8url
      if (cachedUrl) return cachedUrl

      if (!movie) return ''
      const playInfo = await parserService.getPlayUrlById(movieId, episodeNumber, movie.title)
      return playInfo.url
    },
    [episodes, sourceType, movie, movieId]
  )

  const playEpisode = useCallback(
    async (episodeNumber: number, targetUrl?: string) => {
      if (!movie) return false

      setLoadingEpisode(true)
      try {
        const nextUrl = await resolveEpisodeUrl(episodeNumber, targetUrl)
        if (nextUrl) {
          setCurrentEpisode(episodeNumber)
          changeUrl(nextUrl)
          return true
        }
        Alert.alert('播放失败', '无法获取该集的播放链接')
        return false
      } catch (error) {
        console.error('获取播放链接失败:', error)
        Alert.alert('播放失败', '获取播放链接时出错')
        return false
      } finally {
        setLoadingEpisode(false)
      }
    },
    [movie, resolveEpisodeUrl, changeUrl]
  )

  // 如果进入播放页时没有 url 且没有队列，则尝试从剧集数据中获取或请求播放链接
  useEffect(() => {
    if (url || !movie || episodes.length === 0) return

    const currentEp = episodes.find((ep) => ep.number === currentEpisode)
    const cachedUrl = sourceType === 'url' ? currentEp?.url : currentEp?.m3u8url
    if (cachedUrl) {
      changeUrl(cachedUrl)
      return
    }

    // 没有缓存链接时异步获取
    playEpisode(currentEpisode)
  }, [url, movie, currentEpisode, episodes, sourceType, changeUrl, playEpisode])

  const switchToQueueItem = useCallback(
    async (item: QueueItem) => {
      if (!movie) return
      setLoadingEpisode(true)
      try {
        const targetUrl = item.url || (await parserService.getPlayUrlById(item.movieId, item.episode, movie.title)).url
        if (targetUrl) {
          setCurrentEpisode(item.episode)
          changeUrl(targetUrl)
        } else {
          Alert.alert('播放失败', '无法获取队列项的播放链接')
        }
      } catch (error) {
        console.error('获取队列项播放链接失败:', error)
        Alert.alert('播放失败', '获取播放链接时出错')
      } finally {
        setLoadingEpisode(false)
      }
    },
    [movie, changeUrl]
  )

  const playNext = useCallback(async () => {
    setCountdownVisible(false)

    // 优先队列
    if (currentQueue.length > 0) {
      const nextItem = moveToNext()
      if (nextItem) {
        await switchToQueueItem(nextItem)
        return
      }
    }

    // 回退到剧集列表
    if (episodes.length === 0) {
      Alert.alert('提示', '已播放完毕')
      return
    }
    const sortedEpisodes = [...episodes].sort((a, b) => a.number - b.number)
    const idx = sortedEpisodes.findIndex((ep) => ep.number === currentEpisode)
    const nextEpisode = sortedEpisodes[idx + 1]
    if (!nextEpisode) {
      Alert.alert('提示', '已经是最后一集了')
      return
    }
    await playEpisode(nextEpisode.number)
  }, [currentQueue, moveToNext, episodes, currentEpisode, switchToQueueItem, playEpisode])

  const startCountdown = useCallback(
    (nextTitle: string) => {
      if (!settings.autoPlayNext) return
      setNextEpisodeTitle(nextTitle)
      setShowControls(true)
      setCountdownVisible(true)
    },
    [settings.autoPlayNext]
  )

  const handleVideoEnd = useCallback(() => {
    // 优先队列
    if (currentQueue.length > 0 && hasNextInQueue()) {
      const nextItem = currentQueue[currentIndex + 1]
      pause()
      startCountdown(nextItem?.episodeName || '下一集')
      return
    }

    // 回退到剧集列表
    const sortedEpisodes = [...episodes].sort((a, b) => a.number - b.number)
    const idx = sortedEpisodes.findIndex((ep) => ep.number === currentEpisode)
    const nextEpisode = sortedEpisodes[idx + 1]
    if (nextEpisode) {
      pause()
      startCountdown(nextEpisode.name)
    } else {
      pause()
      setShowControls(true)
      Alert.alert('提示', '已播放完毕')
    }
  }, [currentQueue, currentIndex, episodes, currentEpisode, hasNextInQueue, startCountdown, pause])

  const handleCancelCountdown = () => {
    setCountdownVisible(false)
  }

  const handleNextEpisode = useCallback(() => {
    playNext()
  }, [playNext])

  const handleQualityChange = async (newQuality: string) => {
    setQuality(newQuality)
    if (!movie) return
    setLoadingEpisode(true)
    try {
      const playInfo = await parserService.getPlayUrlById(movieId, currentEpisode, movie.title, newQuality)
      if (playInfo.url) {
        changeUrl(playInfo.url)
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

  const handleEpisodeSelect = async (episodeNumber: number) => {
    setShowEpisodeList(false)
    await playEpisode(episodeNumber)
  }

  const handleLoad = useCallback(
    (data: { duration: number }) => {
      if (data.duration > 0) {
        setDuration(data.duration)
      }
      setPlayerReady(true)
      // 视频加载成功后自动开始播放，避免用户点击播放无响应
      play()
    },
    [setDuration, play]
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
        updateProgress(movieId, currentEpisode, data.currentTime, data.seekableDuration)
      }

      // 跳过片头
      if (
        settings.skipIntroOutro &&
        settings.skipIntroEnd > 0 &&
        data.currentTime > 0 &&
        data.currentTime < settings.skipIntroEnd &&
        !introSkippedRef.current
      ) {
        introSkippedRef.current = true
        videoRef.current?.seek(settings.skipIntroEnd)
        setProgress(settings.skipIntroEnd)
      }

      // 跳过片尾：进入片尾区间后自动切下一集
      if (
        settings.skipIntroOutro &&
        settings.skipOutroSeconds > 0 &&
        total > 0 &&
        total - data.currentTime <= settings.skipOutroSeconds &&
        !outroSkippedRef.current
      ) {
        outroSkippedRef.current = true
        handleVideoEnd()
      }
    },
    [
      setProgress,
      setDuration,
      duration,
      updateProgress,
      movieId,
      currentEpisode,
      settings.skipIntroOutro,
      settings.skipIntroEnd,
      settings.skipOutroSeconds,
      handleVideoEnd,
    ]
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
      { text: '确定', onPress: () => navigation.goBack() },
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

  const handleSpeedPress = () => {
    setShowSpeedSelector(true)
  }

  const handleSpeedChange = (speed: number) => {
    setRate(speed)
    updateSettings({ playSpeed: speed })
  }

  const handleFullScreen = useCallback(async () => {
    if (orientationChangingRef.current) return
    orientationChangingRef.current = true
    setTimeout(() => {
      orientationChangingRef.current = false
    }, 2000)
    try {
      if (isFullScreen) {
        // 退出全屏：锁定竖屏
        setIsFullScreen(false)
        orientationChangingRef.current = false
      } else {
        // 进入全屏：解锁方向，让用户自由旋转设备进入横屏
        // 注意：不使用 lockAsync(LANDSCAPE_LEFT)，因为 react-native-screens 4.23.0+
        // 全局 swizzle 了 UIViewController 的方向方法，会导致原生崩溃
        // 参考：expo/expo#43802, expo/expo#45479
        setIsFullScreen(true)
        orientationChangingRef.current = false
      }
    } catch (e) {
      console.warn('切换全屏失败:', e)
    }
  }, [isFullScreen])

  const handleSourceTypeChange = () => {
    const newSourceType = sourceType === 'url' ? 'm3u8url' : 'url'
    setSourceType(newSourceType)

    const currentEpisodeData = episodes.find((ep) => ep.number === currentEpisode)
    if (currentEpisodeData) {
      const newUrl = newSourceType === 'url' ? currentEpisodeData.url : currentEpisodeData.m3u8url
      if (newUrl) {
        changeUrl(newUrl)
      } else {
        Alert.alert('切换失败', `当前集数没有${newSourceType}源`)
      }
    }
  }

  const handleQueueSelect = async (index: number) => {
    const item = moveToIndex(index)
    if (item) {
      await switchToQueueItem(item)
    }
    setShowQueueModal(false)
  }

  const handleQueueRemove = (index: number) => {
    removeFromQueue(index)
  }

  const handleQueueClear = () => {
    clearQueue()
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

  const isFullScreenMode = isFullScreen || isLandscape

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View
        style={[
          styles.playerContainer,
          isFullScreenMode ? styles.playerContainerFull : styles.playerContainerPortrait,
        ]}
      >
        <VideoPlayer
          source={playerUrl || ''}
          paused={!playing || countdownVisible}
          rate={rate}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onError={handleError}
          onEnd={handleVideoEnd}
          videoRef={videoRef}
        />

        <VideoControls
          currentTime={progress}
          duration={duration}
          playing={playing}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onFullScreen={handleFullScreen}
          isFullScreen={isFullScreenMode}
          onSourceTypeChange={episodes.length > 0 ? handleSourceTypeChange : undefined}
          sourceType={sourceType}
          onBack={handleBack}
          onNextEpisode={handleNextEpisode}
          onEpisodeListPress={() => setShowEpisodeList(true)}
          onQueuePress={() => setShowQueueModal(true)}
          onSpeedPress={handleSpeedPress}
          onSettingsPress={() => setShowPlaybackSettings(true)}
          queueLength={currentQueue.length}
          rate={rate}
          title={movie?.title}
          episode={currentEpisode}
          showControls={showControls}
          onToggleControls={() => setShowControls(!showControls)}
          onVolumeChange={handleVolumeChange}
          onQualityPress={handleQualityPress}
          quality={quality}
        />

        <CountdownOverlay
          visible={countdownVisible}
          seconds={settings.autoPlayCountdownSeconds}
          nextTitle={nextEpisodeTitle}
          onPlayNow={playNext}
          onCancel={handleCancelCountdown}
        />

        {(buffering || loadingEpisode) && (
          <View style={styles.buffering}>
            {loadingEpisode ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.bufferingText}>切换中...</Text>
              </>
            ) : (
              <Text style={styles.bufferingText}>加载中...</Text>
            )}
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
                {currentEpisode > 1 && <Text style={styles.portraitEpisode}>第{currentEpisode}集</Text>}
                {movie.overview && (
                  <Text style={styles.portraitOverview} numberOfLines={3}>
                    {movie.overview}
                  </Text>
                )}
              </View>
            </ScrollView>
          )}

          {episodesError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{episodesError}</Text>
              <TouchableOpacity style={styles.errorBannerButton} onPress={loadEpisodes}>
                <Text style={styles.errorBannerButtonText}>重试</Text>
              </TouchableOpacity>
            </View>
          )}

          {episodes.length > 0 && (
            <View style={styles.portraitEpisodes}>
              <Text style={styles.portraitSectionTitle}>选集</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.episodeScroll}>
                {episodes.slice(0, 20).map((ep) => (
                  <TouchableOpacity
                    key={ep.id}
                    style={[styles.episodeChip, ep.number === currentEpisode && styles.episodeChipActive]}
                    onPress={() => handleEpisodeSelect(ep.number)}
                  >
                    <Text
                      style={[
                        styles.episodeChipText,
                        ep.number === currentEpisode && styles.episodeChipTextActive,
                      ]}
                    >
                      {ep.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {episodes.length > 20 && (
                <TouchableOpacity style={styles.moreButton} onPress={() => setShowEpisodeList(true)}>
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

      <PlaybackSpeedSelector
        visible={showSpeedSelector}
        currentSpeed={rate}
        onSelect={handleSpeedChange}
        onClose={() => setShowSpeedSelector(false)}
      />

      <QueueManagerModal
        visible={showQueueModal}
        queue={currentQueue}
        currentIndex={currentIndex}
        onClose={() => setShowQueueModal(false)}
        onSelect={handleQueueSelect}
        onRemove={handleQueueRemove}
        onClear={handleQueueClear}
      />

      <PlaybackSettings
        visible={showPlaybackSettings}
        settings={settings}
        onUpdate={updateSettings}
        onClose={() => setShowPlaybackSettings(false)}
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
                style={[styles.episodeItem, ep.number === currentEpisode && styles.episodeItemActive]}
                onPress={() => handleEpisodeSelect(ep.number)}
              >
                <Text
                  style={[
                    styles.episodeItemText,
                    ep.number === currentEpisode && styles.episodeItemTextActive,
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
    backgroundColor: '#000000',
  },
  playerContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#000000',
  },
  playerContainerPortrait: {
    position: 'relative',
    height: 250,
    width: '100%',
  },
  playerContainerFull: {
    position: 'relative',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  buffering: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -10 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
  },
  networkIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  networkText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  portraitContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  infoScroll: {
    maxHeight: 200,
  },
  infoSection: {
    padding: spacing.md,
  },
  portraitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  portraitEpisode: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  portraitOverview: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  portraitEpisodes: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  portraitSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  episodeScroll: {
    paddingHorizontal: spacing.md,
  },
  episodeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  episodeChipActive: {
    backgroundColor: colors.primary,
  },
  episodeChipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  episodeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  moreButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 14,
    color: colors.primary,
  },
  episodeListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: spacing.md,
  },
  episodeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  episodeListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  episodeList: {
    maxHeight: 300,
  },
  episodeItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  episodeItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  episodeItemText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  episodeItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorBanner: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  errorBannerText: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  errorBannerButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  errorBannerButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
})
