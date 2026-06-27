import React, { useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Pressable, LayoutChangeEvent, GestureResponderEvent } from 'react-native'
import { colors, spacing } from '../../../shared/theme'
import { formatTime } from '../../../shared/utils/format'

interface ControlBarProps {
  currentTime: number
  duration: number
  playing: boolean
  onPlayPause: () => void
  onSeek: (time: number) => void
  onFullScreen?: () => void
  isFullScreen?: boolean
  onSourceTypeChange?: () => void
  sourceType?: 'url' | 'm3u8url'
}

export function ControlBar({
  currentTime,
  duration,
  playing,
  onPlayPause,
  onSeek,
  onFullScreen,
  isFullScreen,
  onSourceTypeChange,
  sourceType
}: ControlBarProps) {
  const progress = duration > 0 ? currentTime / duration : 0
  const barWidth = useRef(1)
  const barRef = useRef<View>(null)

  const onBarLayout = (e: LayoutChangeEvent) => {
    barWidth.current = Math.max(1, e.nativeEvent.layout.width)
  }

  const onBarPress = useCallback((event: GestureResponderEvent) => {
    if (duration <= 0 || barWidth.current <= 0) return
    
    const { locationX } = event.nativeEvent
    const ratio = Math.max(0, Math.min(1, locationX / barWidth.current))
    const seekTime = ratio * duration
    
    console.log('Seeking to:', seekTime, 'ratio:', ratio, 'duration:', duration)
    onSeek(seekTime)
  }, [duration, onSeek])

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View 
          ref={barRef}
          style={styles.progressBar} 
          onLayout={onBarLayout}
        >
          <View style={[styles.progress, { width: `${progress * 100}%` }]} />
          <Pressable
            style={styles.progressHit}
            onPress={onBarPress}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
          <Text style={styles.playIcon}>{playing ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
        {onSourceTypeChange && (
          <TouchableOpacity style={styles.sourceTypeButton} onPress={onSourceTypeChange}>
            <Text style={styles.sourceTypeText}>{sourceType === 'url' ? 'URL' : 'M3U8'}</Text>
          </TouchableOpacity>
        )}
        {onFullScreen && (
          <TouchableOpacity style={styles.fullScreenButton} onPress={onFullScreen}>
            <Text style={styles.fullScreenIcon}>{isFullScreen ? '📱' : '📺'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: spacing.md
  },
  progressContainer: {
    marginBottom: spacing.sm
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative'
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary
  },
  progressHit: {
    ...StyleSheet.absoluteFillObject
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF'
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playButton: {
    padding: spacing.sm
  },
  playIcon: {
    fontSize: 32
  },
  fullScreenButton: {
    padding: spacing.sm,
    marginLeft: spacing.md
  },
  fullScreenIcon: {
    fontSize: 24
  },
  sourceTypeButton: {
    padding: spacing.sm,
    marginLeft: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4
  },
  sourceTypeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600'
  }
})
