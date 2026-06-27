import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, RefreshControl, ScrollView, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMovieStore } from '../../../shared/stores'
import { Movie } from '../../../shared/types/movie'
import { RecommendSection } from '../../home/components'
import { colors, spacing } from '../../../shared/theme'
import { parserService } from '../../../shared/services/parser'
import { useHeaderPadding, useResponsivePadding } from '../../../shared/utils/responsive'

interface RankingScreenProps {
  navigation: NativeStackNavigationProp<any>
}

export function RankingScreen({ navigation }: RankingScreenProps) {
  const {
    topRatedMovies,
    topRatedTVs,
    topRatedAnimation,
    loading,
    fetchTopRated
  } = useMovieStore()

  const [refreshing, setRefreshing] = useState(false)
  const { paddingTop, isTablet } = useHeaderPadding()
  const { horizontalPadding } = useResponsivePadding()

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchTopRated('movie'),
        fetchTopRated('tv'),
        fetchTopRated('animation'),
      ])
    } catch (err) {
      console.error('加载排行榜数据失败:', err)
    }
  }, [fetchTopRated])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData])
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleMoviePress = async (movie: Movie) => {
    try {
      const playInfo = await parserService.getPlayUrlById(movie.id, 1, movie.title)
      if (playInfo.url) {
        navigation.navigate('Player', {
          movieId: movie.id,
          movie: movie,
          episode: 1,
          url: playInfo.url,
        })
      } else {
        Alert.alert('播放失败', '无法获取播放链接')
      }
    } catch (err) {
      console.error('获取播放链接失败:', err)
      Alert.alert('播放失败', '获取播放链接时出错')
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop, paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.title, isTablet && styles.titleTablet]}>排行榜</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <RecommendSection
          title="电影排行榜"
          movies={topRatedMovies.slice(0, 10)}
          onMoviePress={handleMoviePress}
        />

        <RecommendSection
          title="电视剧排行榜"
          movies={topRatedTVs.slice(0, 10)}
          onMoviePress={handleMoviePress}
        />

        <RecommendSection
          title="动漫排行榜"
          movies={topRatedAnimation.slice(0, 10)}
          onMoviePress={handleMoviePress}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  titleTablet: {
    fontSize: 36,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
})
