import React from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import Video, { VideoRef, OnLoadData, OnErrorProps, VideoOnProgressData } from 'react-native-video'

interface VideoPlayerProps {
  source: string
  poster?: string
  paused?: boolean
  onProgress?: (data: { currentTime: number; seekableDuration: number }) => void
  onLoad?: (data: { duration: number }) => void
  onError?: (error: any) => void
  videoRef?: React.RefObject<VideoRef>
}

export function VideoPlayer({ source, poster, paused, onProgress, onLoad, onError, videoRef }: VideoPlayerProps) {
  if (!source) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>暂无播放链接</Text>
        <Text style={styles.subText}>{source || 'url为空'}</Text>
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
        resizeMode="contain"
        onProgress={(data: VideoOnProgressData) => {
          onProgress?.({ currentTime: data.currentTime, seekableDuration: data.seekableDuration })
        }}
        onLoad={(data: OnLoadData) => {
          console.log('Video loaded, duration:', data.duration, 'naturalSize:', data.naturalSize)
          onLoad?.({ duration: data.duration })
        }}
        onError={(error: OnErrorProps) => {
          console.error('Video error:', error)
          onError?.(error)
        }}
        onReadyForDisplay={() => {
          console.log('Video ready for display')
        }}
        repeat={false}
        progressUpdateInterval={250}
        useNativeControls={false}
        controls={false}
      />
    </View>
  )
}

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
