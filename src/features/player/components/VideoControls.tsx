import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Dimensions,
  Platform
} from 'react-native'
import { colors, spacing } from '../../../shared/theme'
import { formatTime } from '../../../shared/utils/format'
import * as Brightness from 'expo-brightness'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface VideoControlsProps {
  currentTime: number
  duration: number
  playing: boolean
  onPlayPause: () => void
  onSeek: (time: number) => void
  onFullScreen?: () => void
  isFullScreen?: boolean
  onSourceTypeChange?: () => void
  sourceType?: 'url' | 'm3u8url'
  onBack?: () => void
  title?: string
  episode?: number
  showControls: boolean
  onToggleControls: () => void
  onVolumeChange?: (volume: number) => void
  onQualityPress?: () => void
  quality?: string
}

export function VideoControls({
  currentTime,
  duration,
  playing,
  onPlayPause,
  onSeek,
  onFullScreen,
  isFullScreen,
  onSourceTypeChange,
  sourceType,
  onBack,
  title,
  episode,
  showControls,
  onToggleControls,
  onVolumeChange,
  onQualityPress,
  quality
}: VideoControlsProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const [showBrightness, setShowBrightness] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [brightnessValue, setBrightnessValue] = useState(0.5)
  const [volumeValue, setVolumeValue] = useState(0.5)

  // 初始化亮度
  useEffect(() => {
    const loadBrightness = async () => {
      try {
        const currentBrightness = await Brightness.getBrightnessAsync()
        setBrightnessValue(currentBrightness)
      } catch (error) {
        console.error('获取亮度失败:', error)
      }
    }
    loadBrightness()
  }, [])
  
  const progressBarRef = useRef<View>(null)
  const progressBarWidth = useRef(0)
  const lastTap = useRef(0)

  const progress = duration > 0 ? currentTime / duration : 0
  const displayProgress = isDragging ? dragProgress : progress

  const handleProgressBarLayout = (event: any) => {
    progressBarWidth.current = event.nativeEvent.layout.width
  }

  const handleProgressPress = (event: GestureResponderEvent) => {
    if (duration <= 0 || progressBarWidth.current <= 0) return
    const { locationX } = event.nativeEvent
    const ratio = Math.max(0, Math.min(1, locationX / progressBarWidth.current))
    const seekTime = ratio * duration
    onSeek(seekTime)
  }

  const handlePanResponderMove = useCallback(
    (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (duration <= 0 || progressBarWidth.current <= 0) return
      
      const { locationX } = event.nativeEvent
      const ratio = Math.max(0, Math.min(1, locationX / progressBarWidth.current))
      setDragProgress(ratio)
    },
    [duration]
  )

  const handlePanResponderRelease = useCallback(
    (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (duration <= 0) return
      const seekTime = dragProgress * duration
      onSeek(seekTime)
      setIsDragging(false)
    },
    [duration, dragProgress, onSeek]
  )

  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true)
        setDragProgress(progress)
      },
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
      onPanResponderTerminate: handlePanResponderRelease
    })
  ).current

  const handleDoubleTap = (event: GestureResponderEvent) => {
    const now = Date.now()
    const { locationX } = event.nativeEvent
    
    if (now - lastTap.current < 300) {
      if (locationX < SCREEN_WIDTH / 2) {
        const newTime = Math.max(0, currentTime - 10)
        onSeek(newTime)
      } else {
        const newTime = Math.min(duration, currentTime + 10)
        onSeek(newTime)
      }
    }
    lastTap.current = now
  }

  const handleVerticalPan = useCallback(
    (event: GestureResponderEvent, gestureState: PanResponderGestureState, side: 'left' | 'right') => {
      const { dy } = gestureState
      const change = -dy / 200
      
      if (side === 'left') {
        setShowBrightness(true)
        const newBrightness = Math.max(0, Math.min(1, brightnessValue + change))
        setBrightnessValue(newBrightness)
        // 设置系统亮度
        Brightness.setBrightnessAsync(newBrightness).catch(error => {
          console.error('设置亮度失败:', error)
        })
      } else {
        setShowVolume(true)
        const newVolume = Math.max(0, Math.min(1, volumeValue + change))
        setVolumeValue(newVolume)
        // 调用音量变化回调
        onVolumeChange?.(newVolume)
      }
    },
    [brightnessValue, volumeValue, onVolumeChange]
  )

  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => handleVerticalPan(evt, gestureState, 'left'),
      onPanResponderRelease: () => setShowBrightness(false),
      onPanResponderTerminate: () => setShowBrightness(false)
    })
  ).current

  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => handleVerticalPan(evt, gestureState, 'right'),
      onPanResponderRelease: () => setShowVolume(false),
      onPanResponderTerminate: () => setShowVolume(false)
    })
  ).current

  if (!showControls) {
    return (
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onToggleControls}
        onPressIn={handleDoubleTap}
      />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
          {episode && episode > 1 && (
            <Text style={styles.episode}>第{episode}集</Text>
          )}
        </View>
        {onSourceTypeChange && (
          <TouchableOpacity style={styles.sourceButton} onPress={onSourceTypeChange}>
            <Text style={styles.sourceText}>{sourceType === 'url' ? '线路1' : '线路2'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.leftGestureArea} {...leftPanResponder.panHandlers} />
      <View style={styles.rightGestureArea} {...rightPanResponder.panHandlers} />

      {showBrightness && (
        <View style={styles.brightnessIndicator}>
          <Text style={styles.indicatorText}>☀️</Text>
          <View style={styles.indicatorBar}>
            <View style={[styles.indicatorProgress, { height: `${brightnessValue * 100}%` }]} />
          </View>
        </View>
      )}

      {showVolume && (
        <View style={styles.volumeIndicator}>
          <Text style={styles.indicatorText}>🔊</Text>
          <View style={styles.indicatorBar}>
            <View style={[styles.indicatorProgress, { height: `${volumeValue * 100}%` }]} />
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.centerPlayButton} onPress={onPlayPause}>
        <Text style={styles.centerPlayIcon}>{playing ? '⏸' : '▶️'}</Text>
      </TouchableOpacity>

      <View style={styles.bottomBar}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(isDragging ? dragProgress * duration : currentTime)}</Text>
          <Text style={styles.timeSeparator}> / </Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <View
          ref={progressBarRef}
          style={styles.progressBarContainer}
          onLayout={handleProgressBarLayout}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${displayProgress * 100}%` }]} />
            <View style={[styles.progressThumb, { left: `${displayProgress * 100}%` }]} />
          </View>
          <TouchableOpacity
            style={styles.progressHitArea}
            onPress={handleProgressPress}
            activeOpacity={1}
            {...progressPanResponder.panHandlers}
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
            <Text style={styles.playIcon}>{playing ? '⏸' : '▶️'}</Text>
          </TouchableOpacity>
          
          {onQualityPress && (
            <TouchableOpacity style={styles.qualityButton} onPress={onQualityPress}>
              <Text style={styles.qualityText}>{quality || '720p'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton}>
            <Text style={styles.nextIcon}>⏭</Text>
          </TouchableOpacity>

          {onFullScreen && (
            <TouchableOpacity style={styles.fullScreenButton} onPress={onFullScreen}>
              <Text style={styles.fullScreenIcon}>{isFullScreen ? '⛶' : '⛶'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'space-between'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: 'transparent'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
    backgroundGradient: {
      colors: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']
    }
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20
  },
  backIcon: {
    fontSize: 18,
    color: '#FFFFFF'
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  episode: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2
  },
  sourceButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12
  },
  sourceText: {
    fontSize: 12,
    color: '#FFFFFF'
  },
  leftGestureArea: {
    position: 'absolute',
    left: 0,
    top: 80,
    bottom: 120,
    width: SCREEN_WIDTH * 0.3,
    backgroundColor: 'transparent'
  },
  rightGestureArea: {
    position: 'absolute',
    right: 0,
    top: 80,
    bottom: 120,
    width: SCREEN_WIDTH * 0.3,
    backgroundColor: 'transparent'
  },
  brightnessIndicator: {
    position: 'absolute',
    left: 30,
    top: '40%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: spacing.md,
    zIndex: 200
  },
  volumeIndicator: {
    position: 'absolute',
    right: 30,
    top: '40%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: spacing.md,
    zIndex: 200
  },
  indicatorText: {
    fontSize: 20,
    marginBottom: spacing.sm
  },
  indicatorBar: {
    width: 4,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  indicatorProgress: {
    width: '100%',
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: 0
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 150,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  centerPlayIcon: {
    fontSize: 36,
    color: '#FFFFFF'
  },
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: 'transparent',
    backgroundGradient: {
      colors: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']
    }
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums']
  },
  timeSeparator: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)'
  },
  progressBarContainer: {
    height: 30,
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1.5,
    overflow: 'visible'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    marginLeft: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3
  },
  progressHitArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  playButton: {
    padding: spacing.sm
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF'
  },
  nextButton: {
    padding: spacing.sm
  },
  nextIcon: {
    fontSize: 20,
    color: '#FFFFFF'
  },
  fullScreenButton: {
    padding: spacing.sm
  },
  fullScreenIcon: {
    fontSize: 20,
    color: '#FFFFFF'
  },
  qualityButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginHorizontal: spacing.sm
  },
  qualityText: {
    fontSize: 12,
    color: '#FFFFFF'
  }
})
