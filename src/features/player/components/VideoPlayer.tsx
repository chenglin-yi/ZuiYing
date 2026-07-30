import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Video, { VideoRef, OnLoadData, OnVideoErrorData, OnProgressData, ViewType } from 'react-native-video'

interface VideoPlayerProps {
  source: string
  poster?: string
  paused?: boolean
  rate?: number
  onProgress?: (data: { currentTime: number; seekableDuration: number }) => void
  onLoad?: (data: { duration: number }) => void
  onError?: (error: any) => void
  onEnd?: () => void
  videoRef?: React.RefObject<VideoRef | null>
}

export const VideoPlayer = memo(function VideoPlayer({
  source,
  poster,
  paused,
  rate,
  onProgress,
  onLoad,
  onError,
  onEnd,
  videoRef,
}: VideoPlayerProps) {
  if (!source) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>暂无播放链接</Text>
        <Text style={styles.subText}>请返回详情页重新选择播放源</Text>
      </View>
    )
  }

  console.log('VideoPlayer rendering with source:', source.substring(0, 80))

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: source }}
        style={styles.video}
        paused={paused}
        rate={rate}
        resizeMode="contain"
        // Android 默认 SurfaceView 在方向变化时容易重建导致闪退/黑屏，
        // 使用 TEXTURE 可让视频视图随普通视图一起变换，稳定性更好。
        // iOS 会忽略该属性。
        viewType={ViewType.TEXTURE}
        onProgress={(data: OnProgressData) => {
          onProgress?.({ currentTime: data.currentTime, seekableDuration: data.seekableDuration })
        }}
        onLoad={(data: OnLoadData) => {
          console.log('Video loaded, duration:', data.duration, 'naturalSize:', data.naturalSize)
          onLoad?.({ duration: data.duration })
        }}
        onError={(error: OnVideoErrorData) => {
          console.error('Video error:', error)
          onError?.(error)
        }}
        onReadyForDisplay={() => {
          console.log('Video ready for display')
        }}
        onEnd={() => {
          console.log('Video ended')
          onEnd?.()
        }}
        repeat={false}
        progressUpdateInterval={250}
        controls={false}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000'
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center'
  },
  subText: {
    color: '#AAAAAA',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10
  }
})
